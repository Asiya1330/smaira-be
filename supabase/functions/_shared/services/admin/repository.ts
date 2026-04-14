import { getAdminClient } from "../../supabase/admin-client.ts";
import type { FlaggedIngredientRow, ProductSubmissionRow } from "../../types/models.ts";
import type { ProductRow } from "../../types/models.ts";
import { insertProduct } from "../products/repository.ts";

export async function listFlaggedIngredients(): Promise<FlaggedIngredientRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("flagged_ingredients")
    .select("*")
    .order("flagged_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as FlaggedIngredientRow[];
}

export async function updateFlaggedIngredientStatus(
  id: string,
  status: string,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase
    .from("flagged_ingredients")
    .update({ status })
    .eq("id", id);
  if (error) throw new Error(error.message);
}

export async function listPendingSubmissions(): Promise<ProductSubmissionRow[]> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("status", "pending")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error(error.message);
  return (data ?? []) as ProductSubmissionRow[];
}

export async function getSubmissionById(
  id: string,
): Promise<ProductSubmissionRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("product_submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as ProductSubmissionRow | null;
}

export async function updateSubmission(
  id: string,
  patch: Partial<ProductSubmissionRow>,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("product_submissions").update(patch).eq(
    "id",
    id,
  );
  if (error) throw new Error(error.message);
}

/** README: approve → insert product + mark submission approved. */
export async function approveSubmission(
  submissionId: string,
): Promise<ProductRow> {
  const row = await getSubmissionById(submissionId);
  if (!row) throw new Error("Submission not found");
  if (row.status !== "pending") throw new Error("Submission is not pending");

  const product = await insertProduct({
    barcode: row.barcode,
    product_name: row.product_name,
    brand: row.brand,
    category: row.category,
    size_count: null,
    absorbency: null,
    ingredients_list: row.ingredients,
    material_composition: null,
    bleaching_method: null,
    synthetic_materials: null,
    preservatives: null,
    fragrance_type: null,
    antibacterial_agents: null,
    ph_level: null,
    usda_organic: null,
    gots_certified: null,
    oeko_tex_certified: null,
    gyno_approved: null,
    image_url: row.image_url,
    score: null,
    source_url: null,
    verified: false,
  });

  await updateSubmission(submissionId, {
    status: "approved",
    review_notes: `Promoted to product id ${product.id}`,
  });

  return product;
}

export async function rejectSubmission(
  submissionId: string,
  notes?: string,
): Promise<void> {
  const row = await getSubmissionById(submissionId);
  if (!row) throw new Error("Submission not found");
  await updateSubmission(submissionId, {
    status: "rejected",
    review_notes: notes ?? row.review_notes,
  });
}
