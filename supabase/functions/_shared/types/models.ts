/** Aligns with README `products` table. */
export type ProductRow = {
  id: string;
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

/** Aligns with README `ingredients` table. */
export type IngredientRow = {
  ingredient_id: string;
  ingredient_name: string;
  inci_name: string;
  impact_score: number | null;
  classification: IngredientClassification | null;
  plain_english_summary: string | null;
  study_title?: string | null;
  pubmed_link?: string | null;
  year_published?: number | null;
  evidence_strength?: string | null;
  conflicting_evidence?: string | null;
  notes?: string | null;
};

export type IngredientClassification =
  | "Beneficial"
  | "Harmful"
  | "Neutral"
  | "No Data";

export type ProductIngredientLink = {
  id: string;
  product_id: string;
  ingredient_id: string;
};

export type ScoringRuleRow = {
  id?: string;
  min_score: number;
  max_score: number;
  rating: string;
  color?: string | null;
};

export type SavedProductRow = {
  id: string;
  user_id: string;
  product_id: string;
  saved_at: string;
};

export type ProductSubmissionRow = {
  id: string;
  user_id: string;
  product_name: string;
  brand: string | null;
  barcode: string;
  category: string | null;
  image_url: string | null;
  ingredients: string | null;
  submitted_at: string;
  status: "pending" | "approved" | "rejected";
  review_notes: string | null;
};

export type FlaggedIngredientRow = {
  id: string;
  product_name: string | null;
  ingredient_name: string | null;
  inci_name: string | null;
  flagged_at: string;
  status: "Pending" | "In Progress" | "Scored" | string;
};
