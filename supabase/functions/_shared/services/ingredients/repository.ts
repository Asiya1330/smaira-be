import { getAdminClient } from "../../supabase/admin-client.ts";
import type { IngredientRow } from "../../types/models.ts";
import type { IngredientDetail } from "../../types/api.ts";

/**
 * Loads ingredients for a product via `product_ingredients` → `ingredients`.
 */
export async function listIngredientsForProduct(
  productId: string,
): Promise<IngredientRow[]> {
  const supabase = getAdminClient();
  const { data: links, error: linkErr } = await supabase
    .from("product_ingredients")
    .select("ingredient_id")
    .eq("product_id", productId);
  if (linkErr) throw new Error(linkErr.message);
  if (!links?.length) return [];

  const ids = [...new Set(links.map((l: { ingredient_id: string }) => l.ingredient_id))];
  const { data: rows, error } = await supabase
    .from("ingredients")
    .select("*")
    .in("ingredient_id", ids);
  if (error) throw new Error(error.message);
  return (rows ?? []) as IngredientRow[];
}

export function toIngredientDetails(rows: IngredientRow[]): IngredientDetail[] {
  return rows.map((r) => ({
    ingredient_name: r.ingredient_name,
    inci_name: r.inci_name,
    classification: r.classification,
    plain_english_summary: r.plain_english_summary,
    impact_score: r.impact_score,
  }));
}
