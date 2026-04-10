import type { IngredientRow } from "../../types/models.ts";
import type { IngredientSummaryCounts, ScoreComputation } from "../../types/api.ts";
import { ratingForScore } from "./rating.ts";

function isNoData(c: string | null | undefined): boolean {
  return c === "No Data";
}

const SCORED_CLASSIFICATIONS = new Set(["Beneficial", "Harmful", "Neutral"]);

function isScoredIngredient(row: IngredientRow): boolean {
  if (isNoData(row.classification)) return false;
  if (!row.classification || !SCORED_CLASSIFICATIONS.has(row.classification)) {
    return false;
  }
  return (
    row.impact_score !== null &&
    row.impact_score !== undefined &&
    !Number.isNaN(Number(row.impact_score))
  );
}

function countSummary(rows: IngredientRow[]): IngredientSummaryCounts {
  let beneficial_count = 0;
  let harmful_count = 0;
  let neutral_count = 0;
  let no_data_count = 0;
  for (const r of rows) {
    const c = r.classification;
    if (c === "Beneficial") beneficial_count++;
    else if (c === "Harmful") harmful_count++;
    else if (c === "Neutral") neutral_count++;
    else if (c === "No Data" || c === null) no_data_count++;
    else no_data_count++;
  }
  return {
    beneficial_count,
    harmful_count,
    neutral_count,
    no_data_count,
  };
}

/**
 * README Steps 3–5: exclude No Data from scoring; only valid impact_score rows contribute.
 */
export function computeProductScore(ingredients: IngredientRow[]): ScoreComputation {
  const summary = countSummary(ingredients);
  const scored = ingredients.filter(isScoredIngredient);
  const n = scored.length;

  if (n === 0) {
    return {
      finalScore: null,
      rating: "Not Recommended",
      rawScore: 0,
      scoredIngredientCount: 0,
      ingredients,
      summary,
    };
  }

  const rawScore = scored.reduce((acc, r) => acc + Number(r.impact_score), 0);
  const minimumPossible = n * -2;
  const maximumPossible = n * 2;
  const normalized =
    ((rawScore - minimumPossible) / (maximumPossible - minimumPossible)) * 100;
  const finalScore = Math.round(Math.min(100, Math.max(0, normalized)));
  const rating = ratingForScore(finalScore);

  return {
    finalScore,
    rating,
    rawScore,
    scoredIngredientCount: n,
    ingredients,
    summary,
  };
}
