import type { IngredientsScoreResponse, ScoredIngredientResult } from "../../types/api.ts";
import type { ClaudeIngredientSuccess, ClaudeScoringInput } from "../../types/claude.ts";
import { scoreIngredientsWithClaude } from "./claude-client.ts";
import { insertFlaggedFromScores } from "./flagged-repository.ts";
import {
  classificationFromSuggested,
  suggestedToDbImpactScore,
} from "./map-scores.ts";

export type ScoreIngredientsInput = ClaudeScoringInput & {
  product_ids?: string[];
};

export async function scoreAndFlagIngredients(
  input: ScoreIngredientsInput,
): Promise<IngredientsScoreResponse> {
  const results = await scoreIngredientsWithClaude(input);

  const successItems = results.filter(
    (r): r is ClaudeIngredientSuccess => r.success,
  );
  const flaggedRows = successItems.length > 0
    ? await insertFlaggedFromScores(
        successItems.map((r) => {
          const s = r.data;
          return {
            product_ids: input.product_ids,
            ingredient_name: s.ingredient_name,
            inci_name: s.inci_name,
            impact_score: suggestedToDbImpactScore(s.suggested_impact_score),
            classification: classificationFromSuggested(s.suggested_impact_score),
            confidence: s.confidence,
            brief_reasoning: s.brief_reasoning,
            needs_human_review: s.needs_human_review,
          };
        }),
      )
    : [];

  let flaggedIdx = 0;
  const ingredients: ScoredIngredientResult[] = results.map((r) => {
    if (!r.success) {
      return {
        success: false as const,
        ingredient_name: r.ingredient_name,
        reason: r.reason,
        claude_response: r.claude_response,
      };
    }
    const s = r.data;
    const flagged_id = flaggedRows[flaggedIdx]?.id ?? null;
    flaggedIdx++;
    return {
      success: true as const,
      ingredient_name: s.ingredient_name,
      inci_name: s.inci_name,
      suggested_impact_score: s.suggested_impact_score,
      classification: s.classification,
      confidence: s.confidence,
      severity_tier: s.severity_tier,
      brief_reasoning: s.brief_reasoning,
      plain_english_summary: s.plain_english_summary,
      short_description: s.short_description,
      pubmed_link: s.pubmed_link,
      needs_human_review: s.needs_human_review,
      flagged_id,
    };
  });

  return { ingredients };
}
