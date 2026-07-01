import { getAdminClient } from "../../supabase/admin-client.ts";
import type { IngredientRow, ProductRow } from "../../types/models.ts";
import { findProductById } from "../products/repository.ts";

export type AdminProductSummary = {
  id: string;
  barcode: string;
  product_name: string | null;
  score: number | null;
};

export type AdminIngredientSummary = {
  ingredient_id: string;
  ingredient_name: string;
  inci_name: string;
  impact_score: string | null;
  classification: string | null;
  /** Populated on `flagged_ingredients` rows; null in the catalog list. */
  confidence: string | null;
};

export type UpdateProductPatch = Partial<
  Pick<
    ProductRow,
    | "barcode"
    | "product_name"
    | "brand"
    | "category"
    | "image_url"
    | "ingredients_list"
    | "score"
    | "verified"
    | "source_url"
  >
>;

export function parseUpdateProductPatch(body: unknown): UpdateProductPatch {
  if (!body || typeof body !== "object") {
    throw new Error("Body must be a JSON object");
  }
  const o = body as Record<string, unknown>;
  const patch: UpdateProductPatch = {};
  if (o.barcode !== undefined) {
    if (typeof o.barcode !== "string" || !o.barcode.trim()) {
      throw new Error("barcode must be a non-empty string");
    }
    patch.barcode = o.barcode.trim();
  }
  if (o.product_name !== undefined) {
    if (o.product_name !== null && (typeof o.product_name !== "string" || !o.product_name.trim())) {
      throw new Error("product_name must be a non-empty string or null");
    }
    patch.product_name = o.product_name === null ? null : o.product_name.trim();
  }
  for (const k of ["brand", "category", "image_url", "ingredients_list", "source_url"] as const) {
    if (o[k] !== undefined) {
      if (o[k] !== null && typeof o[k] !== "string") {
        throw new Error(`${k} must be a string or null`);
      }
      patch[k] = o[k] as string | null;
    }
  }
  if (o.score !== undefined) {
    if (o.score !== null && (typeof o.score !== "number" || !Number.isInteger(o.score))) {
      throw new Error("score must be an integer or null");
    }
    patch.score = o.score;
  }
  if (o.verified !== undefined) {
    if (typeof o.verified !== "boolean") {
      throw new Error("verified must be a boolean");
    }
    patch.verified = o.verified;
  }
  if (Object.keys(patch).length === 0) {
    throw new Error("Body must include at least one field to update");
  }
  return patch;
}

export async function listProductsForAdmin(): Promise<AdminProductSummary[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, barcode, product_name, score")
    .order("product_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []) as AdminProductSummary[];
}

export async function listIngredientsForAdmin(): Promise<AdminIngredientSummary[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("ingredient_id, ingredient_name, inci_name, impact_score, classification")
    .order("ingredient_name", { ascending: true });
  if (error) throw new Error(error.message);
  return (data ?? []).map((r) => ({
    ...(r as Omit<AdminIngredientSummary, "confidence">),
    confidence: null,
  }));
}

export async function updateProduct(
  id: string,
  patch: UpdateProductPatch,
): Promise<ProductRow> {
  const existing = await findProductById(id);
  if (!existing) throw new Error("Product not found");

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!data) throw new Error("Product not found");
  return data as ProductRow;
}

export async function deleteProduct(id: string): Promise<void> {
  const existing = await findProductById(id);
  if (!existing) throw new Error("Product not found");

  const supabase = getAdminClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new Error(error.message);
}

export async function deleteIngredient(id: string): Promise<void> {
  const supabase = getAdminClient();
  const { data: existing, error: findErr } = await supabase
    .from("ingredients")
    .select("ingredient_id")
    .eq("ingredient_id", id)
    .maybeSingle();
  if (findErr) throw new Error(findErr.message);
  if (!existing) throw new Error("Ingredient not found");

  const { error } = await supabase
    .from("ingredients")
    .delete()
    .eq("ingredient_id", id);
  if (error) throw new Error(error.message);
}
