import { getAdminClient } from "../../supabase/admin-client.ts";
import type { ProductRow } from "../../types/models.ts";

export async function findProductByBarcode(
  barcode: string,
): Promise<ProductRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("barcode", barcode)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductRow | null;
}

export async function findProductById(id: string): Promise<ProductRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductRow | null;
}

/**
 * Returns the top-scoring products within a category, highest score first.
 * Products without a score are excluded. Category match is case-insensitive.
 */
export async function findTopProductsByCategory(
  category: string,
  limit = 3,
): Promise<ProductRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .ilike("category", category)
    .not("score", "is", null)
    .order("score", { ascending: false })
    .limit(limit);
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductRow[];
}

export async function updateProductScore(
  productId: string,
  score: number,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("products")
    .update({ score })
    .eq("id", productId);
  if (error) throw new Error(error.message);
}

export async function insertProduct(row: Partial<ProductRow>): Promise<ProductRow> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("products")
    .insert(row)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data as ProductRow;
}
