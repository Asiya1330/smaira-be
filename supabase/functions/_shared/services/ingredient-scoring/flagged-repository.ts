import { getAdminClient } from "../../supabase/admin-client.ts";
import type { FlaggedIngredientRow, IngredientClassification } from "../../types/models.ts";

export type InsertFlaggedFromScoreInput = {
  product_ids?: string[];
  ingredient_name: string;
  inci_name: string;
  impact_score: string | null;
  classification: IngredientClassification;
  confidence: string;
  brief_reasoning: string;
  needs_human_review: boolean;
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function mergeProductIds(existing: string[], incoming: string[]): string[] {
  return [...new Set([...existing, ...incoming])].sort();
}

async function loadExistingByInci(): Promise<
  Map<string, { id: string; product_ids: string[] }>
> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("flagged_ingredients")
    .select("id, inci_name, product_ids");
  if (error) throw new Error(error.message);

  const byInci = new Map<string, { id: string; product_ids: string[] }>();
  for (const row of data ?? []) {
    const inci = (row.inci_name as string | null)?.trim();
    if (!inci) continue;
    const key = normalizeKey(inci);
    if (!byInci.has(key)) {
      byInci.set(key, {
        id: row.id as string,
        product_ids: (row.product_ids as string[]) ?? [],
      });
    }
  }
  return byInci;
}

/**
 * Inserts or updates `flagged_ingredients` by case-insensitive `inci_name`.
 * Existing rows are updated with the latest scores and merged `product_ids`.
 */
export async function insertFlaggedFromScores(
  rows: InsertFlaggedFromScoreInput[],
): Promise<FlaggedIngredientRow[]> {
  if (rows.length === 0) return [];

  const supabase = getAdminClient();
  const existingByInci = await loadExistingByInci();
  const results: FlaggedIngredientRow[] = [];

  for (const row of rows) {
    const inciKey = normalizeKey(row.inci_name);
    const incomingProductIds = row.product_ids ?? [];
    const existing = existingByInci.get(inciKey);

    const patch = {
      ingredient_name: row.ingredient_name,
      inci_name: row.inci_name,
      impact_score: row.impact_score,
      classification: row.classification,
      confidence: row.confidence,
      brief_reasoning: row.brief_reasoning,
      needs_human_review: row.needs_human_review,
      status: "Pending",
    };

    if (existing) {
      const product_ids = mergeProductIds(existing.product_ids, incomingProductIds);
      const { data, error } = await supabase
        .from("flagged_ingredients")
        .update({ ...patch, product_ids })
        .eq("id", existing.id)
        .select()
        .single();
      if (error) throw new Error(error.message);
      const updated = data as FlaggedIngredientRow;
      results.push(updated);
      existingByInci.set(inciKey, { id: existing.id, product_ids });
    } else {
      const { data, error } = await supabase
        .from("flagged_ingredients")
        .insert({
          ...patch,
          product_ids: incomingProductIds,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      const inserted = data as FlaggedIngredientRow;
      results.push(inserted);
      existingByInci.set(inciKey, {
        id: inserted.id,
        product_ids: incomingProductIds,
      });
    }
  }

  return results;
}
