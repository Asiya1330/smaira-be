import { getAdminClient } from "../../supabase/admin-client.ts";
import type {
  FlaggedIngredientRow,
  IngredientRow,
  ProductSubmissionRow,
} from "../../types/models.ts";
import type { ProductRow } from "../../types/models.ts";
import { isValidImpactScoreLabel } from "../scoring/impact-score.ts";
import { insertProduct } from "../products/repository.ts";

/** All non-id columns required on admin create (see docs/api/06-admin.md). */
export type CreateIngredientInput = {
  ingredient_id?: string;
  ingredient_name: string;
  inci_name: string;
  /** Stored labels: `(-2)` … `(+2)`. */
  impact_score: string;
  classification: string;
  plain_english_summary: string;
  study_title: string;
  pubmed_link: string;
  year_published: number;
  evidence_strength: string;
  conflicting_evidence: string;
  notes: string;
};

export type UpdateIngredientPatch = Partial<
  Omit<IngredientRow, "ingredient_id">
>;

const CREATE_KEYS = [
  "ingredient_name",
  "inci_name",
  "impact_score",
  "classification",
  "plain_english_summary",
  "study_title",
  "pubmed_link",
  "year_published",
  "evidence_strength",
  "conflicting_evidence",
  "notes",
] as const;

export function parseCreateIngredientBody(body: unknown): CreateIngredientInput {
  if (!body || typeof body !== "object") {
    throw new Error("Body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  for (const k of CREATE_KEYS) {
    if (o[k] === undefined || o[k] === null) {
      throw new Error(`Body must include ${k}`);
    }
  }
  if (typeof o.ingredient_name !== "string" || !o.ingredient_name.trim()) {
    throw new Error("ingredient_name must be a non-empty string");
  }
  if (typeof o.inci_name !== "string" || !o.inci_name.trim()) {
    throw new Error("inci_name must be a non-empty string");
  }
  if (typeof o.impact_score !== "string" || !o.impact_score.trim()) {
    throw new Error("impact_score must be a non-empty string");
  }
  const impactTrimmed = o.impact_score.trim();
  if (!isValidImpactScoreLabel(impactTrimmed)) {
    throw new Error(
      'impact_score must be one of "(-2)", "(-1)", "(0)", "(+1)", "(+2)"',
    );
  }
  if (typeof o.classification !== "string" || !o.classification.trim()) {
    throw new Error("classification must be a non-empty string");
  }
  if (typeof o.plain_english_summary !== "string") {
    throw new Error("plain_english_summary must be a string");
  }
  for (const k of [
    "study_title",
    "pubmed_link",
    "evidence_strength",
    "conflicting_evidence",
    "notes",
  ] as const) {
    if (typeof o[k] !== "string") {
      throw new Error(`${k} must be a string`);
    }
  }
  if (typeof o.year_published !== "number" || !Number.isInteger(o.year_published)) {
    throw new Error("year_published must be an integer");
  }
  let ingredient_id: string | undefined;
  if (o.ingredient_id !== undefined) {
    if (typeof o.ingredient_id !== "string" || !o.ingredient_id.trim()) {
      throw new Error("ingredient_id must be a non-empty string when provided");
    }
    ingredient_id = o.ingredient_id.trim();
  }
  return {
    ingredient_id,
    ingredient_name: o.ingredient_name.trim(),
    inci_name: o.inci_name.trim(),
    impact_score: impactTrimmed,
    classification: o.classification.trim(),
    plain_english_summary: o.plain_english_summary,
    study_title: o.study_title,
    pubmed_link: o.pubmed_link,
    year_published: o.year_published,
    evidence_strength: o.evidence_strength,
    conflicting_evidence: o.conflicting_evidence,
    notes: o.notes,
  };
}

export function parseUpdateIngredientPatch(body: unknown): UpdateIngredientPatch {
  if (!body || typeof body !== "object") {
    throw new Error("Body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  const patch: UpdateIngredientPatch = {};
  if (o.ingredient_name !== undefined) {
    if (typeof o.ingredient_name !== "string" || !o.ingredient_name.trim()) {
      throw new Error("ingredient_name must be a non-empty string");
    }
    patch.ingredient_name = o.ingredient_name.trim();
  }
  if (o.inci_name !== undefined) {
    if (typeof o.inci_name !== "string" || !o.inci_name.trim()) {
      throw new Error("inci_name must be a non-empty string");
    }
    patch.inci_name = o.inci_name.trim();
  }
  if (o.impact_score !== undefined) {
    if (o.impact_score === null) {
      patch.impact_score = null;
    } else if (
      typeof o.impact_score !== "string" ||
      !isValidImpactScoreLabel(o.impact_score)
    ) {
      throw new Error(
        'impact_score must be null or one of "(-2)", "(-1)", "(0)", "(+1)", "(+2)"',
      );
    } else {
      patch.impact_score = o.impact_score.trim();
    }
  }
  if (o.classification !== undefined) {
    if (typeof o.classification !== "string" || !o.classification.trim()) {
      throw new Error("classification must be a non-empty string");
    }
    patch.classification = o.classification as IngredientRow["classification"];
  }
  if (o.plain_english_summary !== undefined) {
    if (o.plain_english_summary !== null && typeof o.plain_english_summary !== "string") {
      throw new Error("plain_english_summary must be a string or null");
    }
    patch.plain_english_summary = o.plain_english_summary;
  }
  for (const k of [
    "study_title",
    "pubmed_link",
    "evidence_strength",
    "conflicting_evidence",
    "notes",
  ] as const) {
    if (o[k] !== undefined) {
      if (o[k] !== null && typeof o[k] !== "string") {
        throw new Error(`${k} must be a string or null`);
      }
      patch[k] = o[k] as string | null;
    }
  }
  if (o.year_published !== undefined) {
    if (o.year_published !== null &&
      (typeof o.year_published !== "number" || !Number.isInteger(o.year_published))) {
      throw new Error("year_published must be an integer or null");
    }
    patch.year_published = o.year_published;
  }
  return patch;
}

export async function createIngredient(
  input: CreateIngredientInput,
): Promise<IngredientRow> {
  const supabase = getAdminClient();
  const row: Record<string, unknown> = {
    ingredient_name: input.ingredient_name,
    inci_name: input.inci_name,
    impact_score: input.impact_score,
    classification: input.classification,
    plain_english_summary: input.plain_english_summary,
    study_title: input.study_title,
    pubmed_link: input.pubmed_link,
    year_published: input.year_published,
    evidence_strength: input.evidence_strength,
    conflicting_evidence: input.conflicting_evidence,
    notes: input.notes,
  };
  if (input.ingredient_id) {
    row.ingredient_id = input.ingredient_id;
  }
  const { data, error } = await supabase
    .from("ingredients")
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as IngredientRow;
}

export async function updateIngredient(
  id: string,
  patch: UpdateIngredientPatch,
): Promise<IngredientRow> {
  const supabase = getAdminClient();
  const cleaned: Record<string, unknown> = {};
  const keys: (keyof UpdateIngredientPatch)[] = [
    "ingredient_name",
    "inci_name",
    "impact_score",
    "classification",
    "plain_english_summary",
    "study_title",
    "pubmed_link",
    "year_published",
    "evidence_strength",
    "conflicting_evidence",
    "notes",
  ];
  for (const k of keys) {
    if (patch[k] !== undefined) {
      cleaned[k] = patch[k];
    }
  }
  if (Object.keys(cleaned).length === 0) {
    throw new Error("Body must include at least one field to update");
  }
  const { data, error } = await supabase
    .from("ingredients")
    .update(cleaned)
    .eq("ingredient_id", id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Ingredient not found");
  return data as IngredientRow;
}

export async function listFlaggedIngredients(): Promise<FlaggedIngredientRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("flagged_ingredients")
    .select("*")
    .order("flagged_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FlaggedIngredientRow[];
}

/** Allowed `flagged_ingredients.status` values (stored with leading capitals). */
const FLAGGED_INGREDIENT_STATUSES = [
  "Pending",
  "Reviewed",
  "Resolved",
] as const;

function normalizeFlaggedIngredientStatus(raw: string): string {
  const key = raw.trim().toLowerCase();
  const byLower: Record<string, string> = {
    pending: "Pending",
    reviewed: "Reviewed",
    resolved: "Resolved",
  };
  const normalized = byLower[key];
  if (!normalized) {
    throw new Error(
      `status must be one of: ${FLAGGED_INGREDIENT_STATUSES.join(", ")}`,
    );
  }
  return normalized;
}

export async function updateFlaggedIngredientStatus(
  id: string,
  status: string,
): Promise<void> {
  const normalized = normalizeFlaggedIngredientStatus(status);
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("flagged_ingredients")
    .update({ status: normalized })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

/**
 * Sync `No Data` ingredients into `flagged_ingredients` — **one row per `inci_name`** when inserting (case-insensitive match).
 * - Collects all `product_id`s from `product_ingredients` for that ingredient into a single `product_ids` array.
 * - Ingredients with no product links get `product_ids: []`.
 * - If a flagged row already exists for that INCI (first match wins), updates it; otherwise inserts.
 */
export async function syncNoDataIngredientsToFlagged(): Promise<{
  inserted: number;
  updated: number;
  no_data_ingredient_count: number;
}> {
  const supabase = getAdminClient();
  const { data: noDataIng, error: ingErr } = await supabase
    .from("ingredients")
    .select("ingredient_id, ingredient_name, inci_name")
    .eq("classification", "No Data");
  if (ingErr) throw new Error(ingErr.message);
  const byId = new Map(
    (noDataIng ?? []).map((r) => [r.ingredient_id as string, r]),
  );
  const ingredientIds = [...byId.keys()];
  const no_data_ingredient_count = ingredientIds.length;
  if (ingredientIds.length === 0) {
    return { inserted: 0, updated: 0, no_data_ingredient_count: 0 };
  }

  const { data: links, error: linkErr } = await supabase
    .from("product_ingredients")
    .select("product_id, ingredient_id")
    .in("ingredient_id", ingredientIds);
  if (linkErr) throw new Error(linkErr.message);
  const linksList = links ?? [];

  const productIdsByIngredientId = new Map<string, Set<string>>();
  for (const l of linksList) {
    const iid = l.ingredient_id as string;
    const pid = l.product_id as string;
    if (!productIdsByIngredientId.has(iid)) {
      productIdsByIngredientId.set(iid, new Set());
    }
    productIdsByIngredientId.get(iid)!.add(pid);
  }

  const { data: flaggedRows, error: fErr } = await supabase
    .from("flagged_ingredients")
    .select("id, inci_name");
  if (fErr) throw new Error(fErr.message);

  const firstIdByInciLower = new Map<string, string>();
  for (const r of flaggedRows ?? []) {
    const k = (r.inci_name as string | null)?.trim().toLowerCase() ?? "";
    if (!k) continue;
    const id = r.id as string;
    if (!firstIdByInciLower.has(k)) firstIdByInciLower.set(k, id);
  }

  let inserted = 0;
  let updated = 0;

  for (const [iid, ing] of byId) {
    if (!ing.inci_name?.trim()) continue;
    const inci = ing.inci_name.trim();
    const inciLower = inci.toLowerCase();
    const pidSet = productIdsByIngredientId.get(iid);
    const product_ids = pidSet
      ? [...pidSet].sort()
      : [];

    const existingId = firstIdByInciLower.get(inciLower);
    if (existingId) {
      const { error: upErr } = await supabase
        .from("flagged_ingredients")
        .update({
          product_ids,
          ingredient_name: ing.ingredient_name,
          inci_name: inci,
        })
        .eq("id", existingId);
      if (upErr) throw new Error(upErr.message);
      updated++;
    } else {
      const { data: row, error: insErr } = await supabase
        .from("flagged_ingredients")
        .insert({
          product_ids,
          ingredient_name: ing.ingredient_name,
          inci_name: inci,
          status: "Pending",
        })
        .select("id")
        .single();
      if (insErr) throw new Error(insErr.message);
      inserted++;
      if (row?.id) firstIdByInciLower.set(inciLower, row.id as string);
    }
  }

  return { inserted, updated, no_data_ingredient_count };
}

export async function listPendingSubmissions(): Promise<ProductSubmissionRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductSubmissionRow[];
}

export async function getSubmissionById(
  id: string,
): Promise<ProductSubmissionRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductSubmissionRow | null;
}

export async function updateSubmission(
  id: string,
  patch: Partial<ProductSubmissionRow>,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("product_submissions").update(patch).eq(
    "id",
    id,
  );
  if (error) throw new Error(error.message);
}

/** README: approve → insert product + mark submission approved. */
export async function approveSubmission(
  submissionId: string,
): Promise<ProductRow> {
  const row = await getSubmissionById(submissionId);
  if (!row) throw new Error("Submission not found");
  if (row.status !== "pending") throw new Error("Submission is not pending");

  const product = await insertProduct({
    barcode: row.barcode,
    product_name: row.product_name,
    brand: row.brand,
    category: row.category,
    size_count: null,
    absorbency: null,
    ingredients_list: row.ingredients,
    material_composition: null,
    bleaching_method: null,
    synthetic_materials: null,
    preservatives: null,
    fragrance_type: null,
    antibacterial_agents: null,
    ph_level: null,
    usda_organic: null,
    gots_certified: null,
    oeko_tex_certified: null,
    gyno_approved: null,
    image_url: row.image_url,
    score: null,
    source_url: null,
    verified: false,
  });

  await updateSubmission(submissionId, {
    status: "approved",
    review_notes: `Promoted to product id ${product.id}`,
  });

  return product;
}

export async function rejectSubmission(
  submissionId: string,
  notes?: string,
): Promise<void> {
  const row = await getSubmissionById(submissionId);
  if (!row) throw new Error("Submission not found");
  await updateSubmission(submissionId, {
    status: "rejected",
    review_notes: notes ?? row.review_notes,
  });
}
