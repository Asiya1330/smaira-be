/** Claude ingredient scoring API types (Anthropic Messages). */

export type ImpactScore = "+2" | "+1" | "0" | "-1" | "-2" | "No Data";
export type Classification = "Beneficial" | "Harmful" | "Neutral" | "No Data";
export type Confidence = "high" | "medium" | "low";
export type SeverityTier = "High" | "Moderate" | "Low" | null;

export type ClaudeIngredientScore = {
  ingredient_name: string;
  inci_name: string;
  suggested_impact_score: ImpactScore;
  classification: Classification;
  confidence: Confidence;
  severity_tier: SeverityTier;
  brief_reasoning: string;
  plain_english_summary: string;
  short_description: string;
  needs_human_review: boolean;
  pubmed_link: string | null;
};

export type ClaudeScoringInput = {
  ingredients: string[];
  productName?: string;
  productCategory?: string;
  barcode?: string;
  /** Optional Supabase user UUID for Anthropic usage tracking. */
  userId?: string;
  /** Extra instructions appended to the system prompt. */
  prompt?: string;
};
