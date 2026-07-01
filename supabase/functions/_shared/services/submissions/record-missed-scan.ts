import type { ProductRow } from "../../types/models.ts";
import type { InciProductLookup } from "../inci-api/client.ts";
import { type RetrievalSource, upsertPendingSubmissionFromScan } from "./repository.ts";

export type MissedScanLookup = {
  product_name: string;
  brand: string | null;
  category: string | null;
  image_url: string | null;
  ingredients: string | null;
};

/**
 * DB miss → OBF → INCI → always upsert product_submissions.
 */
export async function recordMissedScanFromLookup(
  barcode: string,
  userId: string | null,
  obf: { product: ProductRow } | null,
  inci: InciProductLookup | null,
): Promise<{ submissionId: string; scanCount: number }> {
  const lookup = buildLookup(barcode, obf, inci);
  return upsertPendingSubmissionFromScan({
    barcode,
    user_id: userId,
    ...lookup,
  });
}

/**
 * Builds a lookup object for the missed scan.
 * @param barcode - The barcode of the product.
 * @param obf - The OBF product row.
 * @param inci - The INCI product lookup.
 * @returns The lookup object.
 */
function buildLookup(
  barcode: string,
  obf: { product: ProductRow } | null,
  inci: InciProductLookup | null,
): MissedScanLookup {
  const obfIngredients = obf?.product.ingredients_list?.trim() || null;
  const inciIngredients = inci?.ingredients?.trim() || null;
  const ingredients = obfIngredients || inciIngredients;
  const retrieval_source: RetrievalSource | null = obfIngredients
    ? "open_beauty_facts"
    : inciIngredients
    ? "inci_api"
    : null;

  if (obf?.product) {
    const p = obf.product;
    return {
      product_name: p.product_name ?? `Pending — ${barcode}`,
      brand: p.brand,
      category: p.category,
      image_url: p.image_url,
      ingredients,
      retrieval_source,
    };
  }

  if (inci) {
    return {
      product_name: inci.product_name,
      brand: inci.brand,
      category: inci.category,
      image_url: inci.image_url,
      ingredients,
      retrieval_source,
    };
  }

  return {
    product_name: `Pending — ${barcode}`,
    brand: null,
    category: null,
    image_url: null,
    ingredients: null,
    retrieval_source: null,
  };
}
