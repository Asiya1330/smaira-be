import { getAdminClient } from "../../supabase/admin-client.ts";
import type { ProductSubmissionRow } from "../../types/models.ts";

export type CreateSubmissionInput = {
  user_id: string;
  product_name: string;
  brand?: string | null;
  barcode: string;
  category?: string | null;
  image_url?: string | null;
  ingredients?: string | null;
};

export type UpsertPendingScanInput = {
  barcode: string;
  user_id: string | null;
  product_name: string;
  brand?: string | null;
  category?: string | null;
  image_url?: string | null;
  ingredients?: string | null;
};

export async function upsertPendingSubmissionFromScan(
  input: UpsertPendingScanInput,
): Promise<{ submissionId: string; scanCount: number }> {
  const supabase = getAdminClient();
  const barcode = input.barcode.trim();

  const { data: existing, error: findErr } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("barcode", barcode)
    .eq("status", "pending")
    .maybeSingle();

  if (findErr) throw new Error(findErr.message);

  if (existing) {
    const row = existing as ProductSubmissionRow;
    const scan_count = row.scan_count + 1;

    const patch: Record<string, unknown> = {
      scan_count,
    };

    if (!row.ingredients?.trim() && input.ingredients?.trim()) {
      patch.ingredients = input.ingredients.trim();
    }

    if (row.product_name.startsWith("Pending —") && input.product_name) {
      patch.product_name = input.product_name;
    }
    if (!row.brand && input.brand) patch.brand = input.brand;
    if (!row.category && input.category) patch.category = input.category;
    if (!row.image_url && input.image_url) patch.image_url = input.image_url;

    const { data, error } = await supabase
      .from("product_submissions")
      .update(patch)
      .eq("id", row.id)
      .select("id, scan_count")
      .single();

    if (error) throw new Error(error.message);
    const updated = data as { id: string; scan_count: number };
    return { submissionId: updated.id, scanCount: updated.scan_count };
  }

  const { data, error } = await supabase
    .from("product_submissions")
    .insert({
      user_id: input.user_id,
      product_name: input.product_name,
      brand: input.brand ?? null,
      barcode,
      category: input.category ?? null,
      image_url: input.image_url ?? null,
      ingredients: input.ingredients?.trim() ?? null,
      status: "pending",
      scan_count: 1,
    })
    .select("id, scan_count")
    .single();

  if (error) throw new Error(error.message);
  const created = data as { id: string; scan_count: number };
  return { submissionId: created.id, scanCount: created.scan_count };
}

async function findPendingByBarcode(
  barcode: string,
): Promise<ProductSubmissionRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("barcode", barcode.trim())
    .eq("status", "pending")
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductSubmissionRow | null;
}

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<{ id: string }> {
  const existing = await findPendingByBarcode(input.barcode);
  if (existing) {
    const now = new Date().toISOString();
    const supabase = getAdminClient();
    const { data, error } = await supabase
      .from("product_submissions")
      .update({
        user_id: input.user_id,
        product_name: input.product_name,
        brand: input.brand ?? existing.brand,
        category: input.category ?? existing.category,
        image_url: input.image_url ?? existing.image_url,
        ingredients: input.ingredients ?? existing.ingredients,
        scan_count: existing.scan_count + 1,
      })
      .eq("id", existing.id)
      .select("id")
      .single();
    if (error) throw new Error(error.message);
    return { id: (data as { id: string }).id };
  }

  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .insert({
      user_id: input.user_id,
      product_name: input.product_name,
      brand: input.brand ?? null,
      barcode: input.barcode,
      category: input.category ?? null,
      image_url: input.image_url ?? null,
      ingredients: input.ingredients ?? null,
      status: "pending",
      scan_count: 1,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id };
}
