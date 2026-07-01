import type { IngredientDetail } from "../../types/api.ts";
import type { ProductRow } from "../../types/models.ts";
import { mapObfProductToInsertRow, type ObfProductFields } from "./map-product.ts";

/** Sentinel id for OBF-only products (not yet in `products`). */
export const OBF_EPHEMERAL_PRODUCT_ID = "00000000-0000-0000-0000-000000000000";

type ObfV2Response = {
  status: number;
  product?: ObfProductFields;
};

const BASE = "https://world.openbeautyfacts.org/api/v2/product";

/**
 * Fallback lookup when barcode is missing from our DB.
 * @see https://openbeautyfacts.github.io/openfoodfacts-server/api/
 */
export async function fetchObfByBarcode(
  barcode: string,
): Promise<{ product: ProductRow; ingredients: IngredientDetail[] } | null> {
  const url = `${BASE}/${encodeURIComponent(barcode)}.json`;
  const res = await fetch(url, { headers: { "User-Agent": "ProbayaMicrobiomeApp/1.0" } });
  if (!res.ok) return null;
  const payload = (await res.json()) as ObfV2Response;
  if (payload.status !== 1 || !payload.product) return null;
  const p = payload.product;
  const insertRow = mapObfProductToInsertRow(p, barcode);
  const product: ProductRow = { id: OBF_EPHEMERAL_PRODUCT_ID, ...insertRow };
  const ingredients = mapObfIngredientsToDetails(p);
  return { product, ingredients };
}

function mapObfIngredientsToDetails(p: ObfProductFields): IngredientDetail[] {
  const structured = p.ingredients;
  if (structured?.length) {
    return structured.map((ing) => {
      const label = ingredientLabel(ing);
      return {
        ingredient_name: label,
        inci_name: label,
        classification: null,
        plain_english_summary: null,
        short_description: null,
        impact_score: null,
        point_contribution: null,
      };
    });
  }
  const text = p.ingredients_text?.trim();
  if (!text) return [];
  return splitIngredientsText(text);
}

type ObfIngredient = {
  id?: string;
  text?: string;
};

function ingredientLabel(ing: ObfIngredient): string {
  const t = ing.text?.trim();
  if (t) return t;
  const id = ing.id?.trim();
  if (id) return taxonomyIdToLabel(id);
  return "Unknown ingredient";
}

function taxonomyIdToLabel(id: string): string {
  const withoutLang = id.replace(/^[a-z]{2}:/, "");
  return withoutLang.replace(/-/g, " ").trim() || id;
}

/** Best-effort split when only `ingredients_text` is present (comma / semicolon). */
function splitIngredientsText(raw: string): IngredientDetail[] {
  const parts = raw.split(/[,;]/).map((s) => s.trim()).filter(Boolean);
  return parts.map((label) => ({
    ingredient_name: label,
    inci_name: label,
    classification: null,
    plain_english_summary: null,
    short_description: null,
    impact_score: null,
    point_contribution: null,
  }));
}
