import { getAdminClient } from "../../supabase/admin-client.ts";
import type { IngredientRow } from "../../types/models.ts";
import { computeProductScore } from "../scoring/engine.ts";

const PAGE_SIZE = 1000;

type ProductScoreRow = { id: string; barcode: string; score: number | null };
type LinkRow = { product_id: string; ingredient_id: string };

export type ScoreAllProductsResult = {
  total_products: number;
  /** Products with at least one scorable ingredient (finalScore !== null). */
  scored: number;
  /** Products with no scorable ingredients — score left untouched. */
  unscored: number;
  /** Scores written to the DB (value changed). */
  updated: number;
  /** Already up to date — no write needed. */
  unchanged: number;
  failures: Array<{ product_id: string; error: string }>;
};

/**
 * Fetches every row from a table, paging past the API `max_rows` cap.
 */
async function fetchAll<T>(table: string, columns: string): Promise<T[]> {
  const supabase = getAdminClient();
  const rows: T[] = [];
  let from = 0;
  while (true) {
    const { data, error } = await supabase
      .from(table)
      .select(columns)
      .range(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const batch = (data ?? []) as T[];
    rows.push(...batch);
    if (batch.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }
  return rows;
}

/**
 * Recomputes the score for every product in the catalog (same algorithm as the
 * `products-score` endpoint) and persists changed scores to `products.score`.
 * Products with no scorable ingredients keep their existing score.
 */
export async function scoreAllProducts(): Promise<ScoreAllProductsResult> {
  const supabase = getAdminClient();

  const products = await fetchAll<ProductScoreRow>("products", "id, barcode, score");
  const links = await fetchAll<LinkRow>(
    "product_ingredients",
    "product_id, ingredient_id",
  );
  const ingredients = await fetchAll<IngredientRow>(
    "ingredients",
    "ingredient_id, ingredient_name, inci_name, impact_score, classification",
  );

  const ingredientById = new Map(ingredients.map((i) => [i.ingredient_id, i]));
  const ingredientIdsByProduct = new Map<string, string[]>();
  for (const link of links) {
    const list = ingredientIdsByProduct.get(link.product_id) ?? [];
    list.push(link.ingredient_id);
    ingredientIdsByProduct.set(link.product_id, list);
  }

  const result: ScoreAllProductsResult = {
    total_products: products.length,
    scored: 0,
    unscored: 0,
    updated: 0,
    unchanged: 0,
    failures: [],
  };

  for (const product of products) {
    try {
      const ids = ingredientIdsByProduct.get(product.id) ?? [];
      const rows = ids
        .map((id) => ingredientById.get(id))
        .filter((r): r is IngredientRow => Boolean(r));

      const { finalScore } = computeProductScore(rows);
      if (finalScore === null) {
        result.unscored++;
        continue;
      }
      result.scored++;

      if (finalScore === product.score) {
        result.unchanged++;
        continue;
      }

      const { error } = await supabase
        .from("products")
        .update({ score: finalScore })
        .eq("id", product.id);
      if (error) throw new Error(error.message);
      result.updated++;
    } catch (e) {
      result.failures.push({
        product_id: product.id,
        error: e instanceof Error ? e.message : String(e),
      });
    }
  }

  return result;
}
