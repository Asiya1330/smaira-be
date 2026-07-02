import type { IngredientRow, ProductRow } from "./models.ts";

export type ScanSource =
  | "database"
  | "open_beauty_facts"
  | "inci_api"
  | "not_found";

export type BarcodeScanResponse = {
  source: ScanSource;
  /** DB row, or OBF data mapped to the same `ProductRow` shape (`id` is nil UUID when not persisted). */
  product: ProductRow | null;
  ingredients: IngredientDetail[];
  /** Harmful ingredients summarised for the Microbiome Concerns cards. */
  concerns: ProductConcern[];
  submissionPrompt: { message: string; submitFunction: string } | null;
  /** Set when a pending product_submissions row was created or updated for this scan. */
  submission: { id: string; scan_count: number } | null;
};

/** One Harmful ingredient surfaced as a product concern (frontend cards). */
export type ProductConcern = {
  /** `ingredients.ingredient_name`, shown verbatim as the concern label. */
  name: string;
  /** Derived from `impact_score`: -2 → High, -1 → Moderate, 0/null → Low/Moderate. */
  severity: "High" | "Moderate" | "Low";
  /** `plain_english_summary`, else `notes`, else a generic fallback. */
  description: string;
  /** `ingredients.pubmed_link` when available. */
  learn_more_url: string | null;
};

export type IngredientDetail = {
  ingredient_name: string;
  inci_name: string;
  classification: string | null;
  plain_english_summary: string | null;
  /** Short 2–4 word label from the `ingredients.short_description` column. */
  short_description: string | null;
  /** Same stored labels as DB: `(-2)` … `(+2)`. */
  impact_score: string | null;
  /**
   * Exact points this ingredient moved the final 0–100 score, relative to a
   * neutral baseline. Computed as `impact_score / (scoredCount * 4) * 100`,
   * rounded to 1 decimal (e.g. `-10`, `+5`). Null for No Data / unscored
   * ingredients that did not contribute.
   */
  point_contribution: number | null;
};

export type IngredientSummaryCounts = {
  beneficial_count: number;
  harmful_count: number;
  neutral_count: number;
  no_data_count: number;
};

export type ProductScoreResponse = {
  product: {
    product_name: string;
    brand: string | null;
    category: string | null;
    image_url: string | null;
    score: number | null;
    rating: string;
  };
  ingredients: IngredientDetail[];
  /** Harmful ingredients summarised for the Microbiome Concerns cards. */
  concerns: ProductConcern[];
  summary: IngredientSummaryCounts;
};

export type ScoreComputation = {
  finalScore: number | null;
  rating: string;
  rawScore: number;
  scoredIngredientCount: number;
  ingredients: IngredientRow[];
  summary: IngredientSummaryCounts;
};

/** One Claude-scored ingredient (`ingredients-score` API). */
export type ScoredIngredientSuccess = {
  success: true;
  ingredient_name: string;
  inci_name: string;
  suggested_impact_score: "+2" | "+1" | "0" | "-1" | "-2" | "No Data";
  classification: "Beneficial" | "Harmful" | "Neutral" | "No Data";
  confidence: "high" | "medium" | "low";
  severity_tier: "High" | "Moderate" | "Low" | null;
  brief_reasoning: string;
  plain_english_summary: string;
  short_description: string;
  pubmed_link: string | null;
  needs_human_review: boolean;
  flagged_id: string | null;
};

export type ScoredIngredientFailure = {
  success: false;
  ingredient_name: string;
  reason: string;
  claude_response: Record<string, unknown>;
};

export type ScoredIngredientResult =
  | ScoredIngredientSuccess
  | ScoredIngredientFailure;

export type IngredientsScoreResponse = {
  ingredients: ScoredIngredientResult[];
};

/** `products` table row without `id` (OBF catalog preview / bulk insert). */
export type ProductInsertRow = {
  barcode: string;
  product_name: string | null;
  name?: string | null;
  brand: string | null;
  category: string | null;
  size_count: string | null;
  absorbency: string | null;
  ingredients_list: string | null;
  material_composition: string | null;
  bleaching_method: string | null;
  synthetic_materials: string | null;
  preservatives: string | null;
  fragrance_type: string | null;
  antibacterial_agents: string | null;
  ph_level: string | null;
  usda_organic: boolean | null;
  gots_certified: boolean | null;
  oeko_tex_certified: boolean | null;
  gyno_approved: boolean | null;
  image_url: string | null;
  score: number | null;
  organic?: string | null;
  certifications?: string | null;
  source_url: string | null;
  verified: boolean | null;
};

export type ObfCatalogCategoryGroup = {
  category: string;
  count: number;
  /** OBF category API URLs used for this group (slug, page, page_size). */
  fetch_urls: string[];
  products: ProductInsertRow[];
};

export type ObfCatalogResponse = ObfCatalogCategoryGroup[];
