import type { IngredientClassification } from "../../types/models.ts";

/** Claude / API labels: +2, +1, 0, -1, -2, No Data */
export type SuggestedImpactLabel = "+2" | "+1" | "0" | "-1" | "-2" | "No Data";

const SUGGESTED_LABELS = new Set<string>(["+2", "+1", "0", "-1", "-2", "No Data"]);

export function isValidSuggestedImpactLabel(s: string): s is SuggestedImpactLabel {
  return SUGGESTED_LABELS.has(s.trim());
}

/** Coerces Claude output (number or string) to a canonical score label. */
export function normalizeSuggestedImpactScore(raw: unknown): SuggestedImpactLabel {
  if (typeof raw === "number" && Number.isFinite(raw)) {
    if (raw === 0) return "0";
    if (raw === 1) return "+1";
    if (raw === 2) return "+2";
    if (raw === -1) return "-1";
    if (raw === -2) return "-2";
    throw new Error(`Invalid suggested_impact_score number ${raw}`);
  }

  if (typeof raw === "string") {
    const s = raw.trim();
    if (isValidSuggestedImpactLabel(s)) return s;
    if (s.toLowerCase() === "no data") return "No Data";

    const unsigned = s.replace(/^\+/, "");
    const n = Number(unsigned);
    if (unsigned !== "" && Number.isFinite(n)) {
      return normalizeSuggestedImpactScore(n);
    }
  }

  throw new Error(`Invalid suggested_impact_score "${String(raw)}"`);
}

/** Maps API label to DB `ingredients.impact_score` parenthesis labels. */
export function suggestedToDbImpactScore(
  label: SuggestedImpactLabel,
): string | null {
  switch (label) {
    case "+2":
      return "(+2)";
    case "+1":
      return "(+1)";
    case "0":
      return "(0)";
    case "-1":
      return "(-1)";
    case "-2":
      return "(-2)";
    case "No Data":
      return null;
  }
}

export function classificationFromSuggested(
  label: SuggestedImpactLabel,
): IngredientClassification {
  if (label === "No Data") return "No Data";
  if (label === "+2" || label === "+1") return "Beneficial";
  if (label === "0") return "Neutral";
  return "Harmful";
}

export type ConfidenceLevel = "high" | "medium" | "low";

const CONFIDENCE_LEVELS = new Set<string>(["high", "medium", "low"]);

export function normalizeConfidence(raw: string): ConfidenceLevel {
  const c = raw.trim().toLowerCase();
  if (!CONFIDENCE_LEVELS.has(c)) {
    throw new Error(`confidence must be high, medium, or low (got "${raw}")`);
  }
  return c as ConfidenceLevel;
}
