import type { IngredientRow, ProductRow } from "./models.ts";

export type ScanSource = "database" | "open_beauty_facts" | "not_found";

export type BarcodeScanResponse = {
  source: ScanSource;
  /** DB row, or OBF data mapped to the same `ProductRow` shape (`id` is nil UUID when not persisted). */
  product: ProductRow | null;
  ingredients: IngredientDetail[];
  submissionPrompt: { message: string; submitFunction: string } | null;
};

export type IngredientDetail = {
  ingredient_name: string;
  inci_name: string;
  classification: string | null;
  plain_english_summary: string | null;
  /** Same stored labels as DB: `(-2)` … `(+2)`. */
  impact_score: string | null;
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
