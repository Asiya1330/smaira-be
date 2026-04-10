import type { IngredientRow, ProductRow } from "./models.ts";

export type ScanSource = "database" | "open_beauty_facts" | "not_found";

export type BarcodeScanResponse = {
  source: ScanSource;
  product: ProductRow | MappedObfProduct | null;
  ingredients: IngredientDetail[];
  submissionPrompt: { message: string; submitFunction: string } | null;
};

/** OBF-mapped shape when product is not yet in DB (subset of ProductRow). */
export type MappedObfProduct = {
  name: string;
  brand: string | null;
  barcode: string;
  category: string | null;
  image_url: string | null;
  source_url: string | null;
};

export type IngredientDetail = {
  ingredient_name: string;
  inci_name: string;
  classification: string | null;
  plain_english_summary: string | null;
  impact_score: number | null;
};

export type IngredientSummaryCounts = {
  beneficial_count: number;
  harmful_count: number;
  neutral_count: number;
  no_data_count: number;
};

export type ProductScoreResponse = {
  product: {
    name: string;
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
