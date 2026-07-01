import type { IngredientRow } from "../../types/models.ts";
import type { ProductConcern } from "../../types/api.ts";
import { parseImpactScoreToNumber } from "./impact-score.ts";

const GENERIC_DESCRIPTION =
  "This ingredient has been flagged as potentially harmful to the vaginal microbiome.";

const SEVERITY_ORDER: Record<ProductConcern["severity"], number> = {
  High: 0,
  Moderate: 1,
  Low: 2,
};

function severityForConcern(row: IngredientRow): ProductConcern["severity"] {
  const n = parseImpactScoreToNumber(row.impact_score);
  if (n === -2) return "High";
  if (n === -1) return "Moderate";
  if (n === 0) return "Low";
  // impact_score null/unexpected on a Harmful ingredient → default fallback.
  return "Moderate";
}

function descriptionForConcern(row: IngredientRow): string {
  return row.plain_english_summary?.trim() ||
    row.notes?.trim() ||
    GENERIC_DESCRIPTION;
}

/**
 * Builds Microbiome Concerns cards from a product's ingredients: every row
 * classified `Harmful`, sorted High → Moderate → Low.
 */
export function buildConcerns(rows: IngredientRow[]): ProductConcern[] {
  return rows
    .filter((r) => r.classification === "Harmful")
    .map((r) => ({
      name: r.ingredient_name,
      severity: severityForConcern(r),
      description: descriptionForConcern(r),
      learn_more_url: r.pubmed_link?.trim() || null,
    }))
    .sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);
}
