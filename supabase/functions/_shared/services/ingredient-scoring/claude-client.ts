import {
  DEFAULT_CLAUDE_MODEL,
  getAnthropicApiKey,
  getClaudeModel,
} from "../../config/env.ts";
import type {
  Classification,
  ClaudeIngredientScore,
  ClaudeIngredientResult,
  ClaudeScoringInput,
  Confidence,
  ImpactScore,
  SeverityTier,
} from "../../types/claude.ts";
import { INGREDIENT_SCORING_SYSTEM_PROMPT } from "../../prompts/ingredient-scoring-system-prompt.ts";
import {
  classificationFromSuggested,
  normalizeSuggestedImpactScore,
  normalizeConfidence,
} from "./map-scores.ts";

const ANTHROPIC_MESSAGES_URL = "https://api.anthropic.com/v1/messages";
const MAX_TOKENS = 4096;
const TEMPERATURE = 0.1;
const RETRYABLE_STATUSES = new Set([503, 529]);
const RETRY_DELAYS_MS = [1000, 2000, 4000];

type ClaudeMessagesResponse = {
  content?: Array<{ type: string; text?: string }>;
  error?: { message?: string };
};

function buildUserMessage(input: ClaudeScoringInput): string {
  const lines = [
    "Score the following ingredients for their impact on vaginal microbiome health.",
    "",
  ];
  if (input.productName?.trim()) {
    lines.push(`Product name: ${input.productName.trim()}`);
  }
  if (input.productCategory?.trim()) {
    lines.push(`Product category: ${input.productCategory.trim()}`);
  }
  if (input.barcode?.trim()) {
    lines.push(`Barcode: ${input.barcode.trim()}`);
  }
  if (lines.length > 2) lines.push("");
  lines.push("Ingredient list:");
  input.ingredients.forEach((ing, i) => lines.push(`${i + 1}. ${ing}`));
  lines.push("");
  lines.push(
    "Return the result as a JSON array with one object per ingredient.",
  );
  return lines.join("\n");
}

function extractJsonText(raw: string): string {
  return raw.replace(/```json|```/g, "").trim();
}

const CLASSIFICATIONS = new Set<string>([
  "Beneficial",
  "Harmful",
  "Neutral",
  "No Data",
]);

const SEVERITY_TIERS = new Set<string>(["High", "Moderate", "Low"]);

function parseSeverityTier(
  raw: unknown,
  classification: Classification,
): SeverityTier {
  if (raw === null || raw === undefined || raw === "") return null;
  if (typeof raw !== "string") {
    throw new Error("severity_tier must be a string or null");
  }
  const tier = raw.trim();
  if (!tier) return null;
  if (classification !== "Harmful") {
    throw new Error(
      `severity_tier must be null when classification is "${classification}"`,
    );
  }
  if (!SEVERITY_TIERS.has(tier)) {
    throw new Error(`severity_tier must be High, Moderate, Low, or null`);
  }
  return tier as SeverityTier;
}

function parseClassification(
  raw: unknown,
  suggested: ImpactScore,
): Classification {
  if (typeof raw !== "string" || !CLASSIFICATIONS.has(raw.trim())) {
    throw new Error(
      `classification must be Beneficial, Harmful, Neutral, or No Data`,
    );
  }
  const classification = raw.trim() as Classification;
  const expected = classificationFromSuggested(suggested);
  if (classification !== expected) {
    throw new Error(
      `classification "${classification}" does not match suggested_impact_score "${suggested}" (expected "${expected}")`,
    );
  }
  return classification;
}

function parseScoredIngredient(item: unknown): ClaudeIngredientScore {
  if (!item || typeof item !== "object") {
    throw new Error("Each ingredient entry must be an object");
  }
  const o = item as Record<string, unknown>;

  const ingredient_name = typeof o.ingredient_name === "string"
    ? o.ingredient_name.trim()
    : "";
  const inci_name = typeof o.inci_name === "string" ? o.inci_name.trim() : "";

  if (!ingredient_name) throw new Error("ingredient_name is required");
  if (!inci_name) throw new Error("inci_name is required");

  const suggested_impact_score = normalizeSuggestedImpactScore(
    o.suggested_impact_score,
  );

  if (typeof o.confidence !== "string") {
    throw new Error(`confidence is required for ${ingredient_name}`);
  }
  const confidence: Confidence = normalizeConfidence(o.confidence);

  const classification = parseClassification(
    o.classification,
    suggested_impact_score,
  );
  const severity_tier = parseSeverityTier(o.severity_tier, classification);

  const brief_reasoning = typeof o.brief_reasoning === "string"
    ? o.brief_reasoning.trim()
    : "";
  const plain_english_summary = typeof o.plain_english_summary === "string"
    ? o.plain_english_summary.trim()
    : "";
  const short_description = typeof o.short_description === "string"
    ? o.short_description.trim()
    : "";

  if (!brief_reasoning) {
    throw new Error(`brief_reasoning is required for ${ingredient_name}`);
  }
  if (!plain_english_summary) {
    throw new Error(
      `plain_english_summary is required for ${ingredient_name}`,
    );
  }
  if (!short_description) {
    throw new Error(`short_description is required for ${ingredient_name}`);
  }
  if (typeof o.needs_human_review !== "boolean") {
    throw new Error(`needs_human_review must be boolean for ${ingredient_name}`);
  }

  let pubmed_link: string | null = null;
  if (o.pubmed_link !== null && o.pubmed_link !== undefined) {
    if (typeof o.pubmed_link !== "string") {
      throw new Error(`pubmed_link must be a string or null for ${ingredient_name}`);
    }
    pubmed_link = o.pubmed_link.trim() || null;
  }

  return {
    ingredient_name,
    inci_name,
    suggested_impact_score,
    classification,
    confidence,
    severity_tier,
    brief_reasoning,
    plain_english_summary,
    short_description,
    needs_human_review: o.needs_human_review,
    pubmed_link,
  };
}

function parseScoredPayload(text: string): ClaudeIngredientResult[] {
  const jsonText = extractJsonText(text);
  console.log("Claude Client jsonText", jsonText);
  let parsed: unknown;
  try {
    parsed = JSON.parse(jsonText);
  } catch {
    throw new Error("Claude response was not valid JSON");
  }

  let list: unknown[];
  if (Array.isArray(parsed)) {
    list = parsed;
  } else if (
    parsed &&
    typeof parsed === "object" &&
    Array.isArray((parsed as { ingredients?: unknown }).ingredients)
  ) {
    list = (parsed as { ingredients: unknown[] }).ingredients;
  } else {
    throw new Error("Claude response must be a JSON array of ingredient scores");
  }

  if (list.length === 0) {
    throw new Error("Claude response must include at least one ingredient");
  }

  return list.map((item) => {
    const raw = (item && typeof item === "object" ? item : {}) as Record<string, unknown>;
    const name = typeof raw.ingredient_name === "string"
      ? raw.ingredient_name
      : "unknown";
    try {
      const data = parseScoredIngredient(item);
      return { success: true as const, ingredient_name: data.ingredient_name, data };
    } catch (err) {
      const reason = err instanceof Error ? err.message : String(err);
      return {
        success: false as const,
        ingredient_name: name,
        reason,
        claude_response: raw,
      };
    }
  });
}

const CLAUDE_MODEL_DOCS =
  "https://platform.claude.com/docs/en/about-claude/models/overview";

function formatClaudeApiError(
  status: number,
  errBody: string,
  model: string,
): string {
  let anthropicMessage = "";
  try {
    const parsed = JSON.parse(errBody) as {
      error?: { type?: string; message?: string };
    };
    anthropicMessage = parsed.error?.message?.trim() ?? "";
  } catch {
    // ignore non-JSON bodies
  }

  const modelUnavailable = status === 404 &&
    (anthropicMessage.toLowerCase().includes("model") ||
      anthropicMessage.includes("not_found"));

  if (modelUnavailable) {
    const detail = anthropicMessage
      ? ` Anthropic says: "${anthropicMessage}".`
      : "";
    return (
      `Claude model "${model}" is not available.${detail} ` +
      `Set CLAUDE_MODEL to a supported model id (current default: ${DEFAULT_CLAUDE_MODEL}) ` +
      `in supabase/functions/.env.local or Edge Function secrets, then restart or redeploy. ` +
      `See ${CLAUDE_MODEL_DOCS}`
    );
  }

  const detail = anthropicMessage || errBody.slice(0, 300);
  return (
    `Claude API request failed (HTTP ${status}). ` +
    `Check ANTHROPIC_API_KEY and CLAUDE_MODEL (currently "${model}"). ` +
    `Details: ${detail}`
  );
}

async function postMessages(body: Record<string, unknown>): Promise<Response> {
  return fetch(ANTHROPIC_MESSAGES_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": getAnthropicApiKey(),
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify(body),
  });
}

async function callAnthropicWithRetry(
  body: Record<string, unknown>,
): Promise<ClaudeMessagesResponse> {
  const model = typeof body.model === "string" ? body.model : getClaudeModel();
  let lastError = formatClaudeApiError(0, "Anthropic API request failed", model);

  for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
    const res = await postMessages(body);

    if (res.ok) {
      return (await res.json()) as ClaudeMessagesResponse;
    }

    const errBody = await res.text();
    lastError = formatClaudeApiError(res.status, errBody, model);

    if (RETRYABLE_STATUSES.has(res.status) && attempt < RETRY_DELAYS_MS.length) {
      await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
      continue;
    }

    throw new Error(lastError);
  }

  throw new Error(lastError);
}

/**
 * Calls the Anthropic Messages API to score ingredients for vaginal microbiome impact.
 */
export async function scoreIngredientsWithClaude(
  input: ClaudeScoringInput,
): Promise<ClaudeIngredientResult[]> {
  const ingredients = input.ingredients.map((s) => s.trim()).filter(Boolean);
  if (ingredients.length === 0) {
    throw new Error("ingredients must be a non-empty array of strings");
  }

  const systemWithContext = input.prompt?.trim()
    ? `${INGREDIENT_SCORING_SYSTEM_PROMPT}\n\n=== ADDITIONAL INSTRUCTIONS ===\n\n${input.prompt.trim()}`
    : INGREDIENT_SCORING_SYSTEM_PROMPT;

  const model = getClaudeModel();
  const requestBody: Record<string, unknown> = {
    model,
    max_tokens: MAX_TOKENS,
    temperature: TEMPERATURE,
    system: systemWithContext,
    messages: [{ role: "user", content: buildUserMessage({ ...input, ingredients }) }],
  };

  if (input.userId?.trim()) {
    requestBody.metadata = { user_id: input.userId.trim() };
  }

  const payload = await callAnthropicWithRetry(requestBody);
  if (payload.error?.message) {
    throw new Error(
      formatClaudeApiError(
        404,
        JSON.stringify({ error: payload.error }),
        model,
      ),
    );
  }

  const text = payload.content
    ?.filter((b) => b.type === "text")
    .map((b) => b.text ?? "")
    .join("");

  if (!text) throw new Error("Claude returned no text content");

  console.log("Claude Client text", text);

  const results = parseScoredPayload(text);

  console.log("Claude Client results", results);
  if (results.length !== ingredients.length) {
    console.warn(
      `Claude returned ${results.length} ingredients; requested ${ingredients.length}`,
    );
  }
  return results;
}

/** Alias matching the Probya integration guide naming. */
export const callClaudeScoring = scoreIngredientsWithClaude;
