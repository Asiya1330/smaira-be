import { getAdminClient } from "../../supabase/admin-client.ts";
import type { FlaggedIngredientRow, IngredientRow } from "../../types/models.ts";
import {
  createIngredient,
  updateFlaggedIngredientStatus,
  updateIngredient,
} from "./repository.ts";

async function getFlaggedById(id: string): Promise<FlaggedIngredientRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("flagged_ingredients")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as FlaggedIngredientRow | null;
}

async function findIngredientByInci(inci: string): Promise<IngredientRow | null> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("*")
    .ilike("inci_name", inci.trim())
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data as IngredientRow | null;
}

async function linkProductToIngredient(
  productId: string,
  ingredientId: string,
): Promise<void> {
  const supabase = getAdminClient();
  const { error } = await supabase.from("product_ingredients").upsert(
    { product_id: productId, ingredient_id: ingredientId },
    { onConflict: "product_id,ingredient_id", ignoreDuplicates: true },
  );
  if (error) throw new Error(error.message);
}

/**
 * Promotes a flagged row into `ingredients` (upsert by INCI), links `product_ids`, marks Resolved.
 */
export async function approveFlaggedIngredient(
  flaggedId: string,
): Promise<{ ingredient: IngredientRow; flagged_id: string }> {
  const flagged = await getFlaggedById(flaggedId);
  if (!flagged) throw new Error("Flagged ingredient not found");
  if (flagged.status === "Resolved" || flagged.status === "Rejected") {
    throw new Error("Flagged ingredient has already been reviewed");
  }
  const inci = flagged.inci_name?.trim();
  const name = flagged.ingredient_name?.trim() || inci;
  if (!inci || !name) {
    throw new Error("Flagged row must include ingredient_name and inci_name");
  }
  if (!flagged.impact_score || !flagged.classification) {
    throw new Error(
      "Flagged row must include impact_score and classification before approval",
    );
  }

  const summary = flagged.brief_reasoning?.trim() ?? "";
  const notes = flagged.confidence
    ? `Approved from flagged queue (confidence: ${flagged.confidence}).`
    : "Approved from flagged queue.";

  const existing = await findIngredientByInci(inci);
  let ingredient: IngredientRow;
  if (existing) {
    ingredient = await updateIngredient(existing.ingredient_id, {
      ingredient_name: name,
      inci_name: inci,
      impact_score: flagged.impact_score,
      classification: flagged.classification,
      plain_english_summary: summary || existing.plain_english_summary,
      notes: notes || existing.notes,
    });
  } else {
    ingredient = await createIngredient({
      ingredient_name: name,
      inci_name: inci,
      impact_score: flagged.impact_score,
      classification: flagged.classification,
      plain_english_summary: summary,
      study_title: "",
      pubmed_link: "",
      year_published: 0,
      evidence_strength: "",
      conflicting_evidence: "",
      notes,
    });
  }

  for (const productId of flagged.product_ids ?? []) {
    await linkProductToIngredient(productId, ingredient.ingredient_id);
  }

  await updateFlaggedIngredientStatus(flaggedId, "Resolved");
  return { ingredient, flagged_id: flaggedId };
}

export async function rejectFlaggedIngredient(flaggedId: string): Promise<void> {
  const flagged = await getFlaggedById(flaggedId);
  if (!flagged) throw new Error("Flagged ingredient not found");
  if (flagged.status === "Resolved" || flagged.status === "Rejected") {
    throw new Error("Flagged ingredient has already been reviewed");
  }
  await updateFlaggedIngredientStatus(flaggedId, "Rejected");
}
