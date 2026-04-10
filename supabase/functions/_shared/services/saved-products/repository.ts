import { getAdminClient } from "../../supabase/admin-client.ts";
import type { ProductRow } from "../../types/models.ts";

export type SavedWithProduct = {
  id: string;
  product_id: string;
  saved_at: string;
  product: ProductRow | null;
};

export async function listSavedForUser(
  userId: string,
): Promise<SavedWithProduct[]> {
  const supabase = getAdminClient();
  const { data: saved, error } = await supabase
    .from("saved_products")
    .select("id, product_id, saved_at")
    .eq("user_id", userId)
    .order("saved_at", { ascending: false });
  if (error) throw new Error(error.message);
  if (!saved?.length) return [];

  const productIds = saved.map((s: { product_id: string }) => s.product_id);
  const { data: products, error: pErr } = await supabase
    .from("products")
    .select("*")
    .in("id", productIds);
  if (pErr) throw new Error(pErr.message);
  const byId = new Map((products as ProductRow[]).map((p) => [p.id, p]));

  return saved.map((s: { id: string; product_id: string; saved_at: string }) => ({
    id: s.id,
    product_id: s.product_id,
    saved_at: s.saved_at,
    product: byId.get(s.product_id) ?? null,
  }));
}

export async function saveProduct(
  userId: string,
  productId: string,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("saved_products").insert({
    user_id: userId,
    product_id: productId,
  });
  if (error) throw new Error(error.message);
}

export async function removeSaved(
  userId: string,
  productId: string,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("saved_products")
    .delete()
    .eq("user_id", userId)
    .eq("product_id", productId);
  if (error) throw new Error(error.message);
}
