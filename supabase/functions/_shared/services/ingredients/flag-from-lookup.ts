import type { IngredientDetail } from "../../types/api.ts";
import { getAdminClient } from "../../supabase/admin-client.ts";
import type { InciProductLookup } from "../inci-api/client.ts";

export type LookupIngredientInput = {
  ingredient_name: string;
  inci_name: string;
};

function normalizeKey(value: string): string {
  return value.trim().toLowerCase();
}

function dedupeByInciKey(
  items: LookupIngredientInput[],
): LookupIngredientInput[] {
  const byKey = new Map<string, LookupIngredientInput>();
  for (const item of items) {
    const inci = item.inci_name.trim();
    if (!inci) continue;
    const key = normalizeKey(inci);
    if (!byKey.has(key)) {
      byKey.set(key, {
        ingredient_name: item.ingredient_name.trim() || inci,
        inci_name: inci,
      });
    }
  }
  return [...byKey.values()];
}

/**
 * Collects ingredient names from OBF structured list and/or INCI comma-separated text.
 */
export function collectLookupIngredients(
  obf: { ingredients: IngredientDetail[] } | null,
  inci: InciProductLookup | null,
): LookupIngredientInput[] {
  const items: LookupIngredientInput[] = [];

  for (const ing of obf?.ingredients ?? []) {
    const name = ing.ingredient_name.trim();
    const inciName = ing.inci_name.trim() || name;
    if (!inciName) continue;
    items.push({
      ingredient_name: name || inciName,
      inci_name: inciName,
    });
  }

  const inciText = inci?.ingredients?.trim();
  if (inciText) {
    for (const part of inciText.split(/[,;]/).map((s) => s.trim()).filter(Boolean)) {
      items.push({ ingredient_name: part, inci_name: part });
    }
  }

  return dedupeByInciKey(items);
}

async function existsInCatalog(inci: string): Promise<boolean> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("ingredients")
    .select("ingredient_id")
    .ilike("inci_name", inci.trim())
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

async function existsInFlagged(inci: string): Promise<boolean> {
  const supabase = getAdminClient();
  const { data, error } = await supabase
    .from("flagged_ingredients")
    .select("id")
    .ilike("inci_name", inci.trim())
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return !!data;
}

/**
 * Persists OBF/INCI ingredient names that are missing from the catalog:
 * - `ingredients` row with `classification: "No Data"` (case-insensitive `inci_name`)
 * - `flagged_ingredients` row with `status: "Pending"`
 */
export async function flagMissingLookupIngredients(
  items: LookupIngredientInput[],
): Promise<{
  ingredients_inserted: number;
  flagged_inserted: number;
  skipped: number;
}> {
  const deduped = dedupeByInciKey(items);
  if (deduped.length === 0) {
    return { ingredients_inserted: 0, flagged_inserted: 0, skipped: 0 };
  }

  const supabase = getAdminClient();
  let ingredients_inserted = 0;
  let flagged_inserted = 0;
  let skipped = 0;

  for (const item of deduped) {
    const inCatalog = await existsInCatalog(item.inci_name);
    const inFlagged = await existsInFlagged(item.inci_name);

    if (inCatalog && inFlagged) {
      skipped++;
      continue;
    }

    if (!inCatalog) {
      const { error } = await supabase.from("ingredients").insert({
        ingredient_name: item.ingredient_name,
        inci_name: item.inci_name,
        classification: "No Data",
        impact_score: null,
        plain_english_summary: null,
      });
      if (error) throw new Error(error.message);
      ingredients_inserted++;
    }

    if (!inFlagged) {
      const { error } = await supabase.from("flagged_ingredients").insert({
        product_ids: [],
        ingredient_name: item.ingredient_name,
        inci_name: item.inci_name,
        classification: "No Data",
        impact_score: null,
        status: "Pending",
      });
      if (error) throw new Error(error.message);
      flagged_inserted++;
    }
  }

  return { ingredients_inserted, flagged_inserted, skipped };
}
