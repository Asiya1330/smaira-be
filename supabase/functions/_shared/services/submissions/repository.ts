import { getAdminClient } from "../../supabase/admin-client.ts";

export type CreateSubmissionInput = {
  user_id: string;
  product_name: string;
  brand?: string | null;
  barcode: string;
  category?: string | null;
  image_url?: string | null;
  ingredients?: string | null;
};

export async function createSubmission(
  input: CreateSubmissionInput,
): Promise<{ id: string }> {
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
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  return { id: (data as { id: string }).id };
}
