import type { BarcodeScanResponse } from "../../types/api.ts";
import {
  collectLookupIngredients,
  flagMissingLookupIngredients,
} from "../ingredients/flag-from-lookup.ts";
import {
  listIngredientsForProduct,
  toIngredientDetails,
} from "../ingredients/repository.ts";
import { fetchInciProductByBarcode } from "../inci-api/client.ts";
import type { InciProductLookup } from "../inci-api/client.ts";
import { fetchObfByBarcode } from "../open-beauty-facts/client.ts";
import { findProductByBarcode, updateProductScore } from "../products/repository.ts";
import { buildConcerns } from "../scoring/concerns.ts";
import { computeProductScore } from "../scoring/engine.ts";
import { recordMissedScanFromLookup } from "../submissions/record-missed-scan.ts";

const SUBMIT_FN = "product-submissions";

/**
 * DB → Open Beauty Facts → INCI API → upsert product_submissions on catalog miss.
 */
export async function runBarcodeScan(
  barcode: string,
  userId: string | null = null,
): Promise<BarcodeScanResponse> {
  const trimmed = barcode.trim();
  if (!trimmed) {
    throw new Error("barcode is required");
  }

  const existing = await findProductByBarcode(trimmed);
  if (existing?.id) {
    const ingredients = await listIngredientsForProduct(existing.id);
    // Ingredients are continuously (re)scored by the ingredients-score API, so
    // recompute the product score on every scan and persist when it changed.
    const { finalScore } = computeProductScore(ingredients);
    if (finalScore !== null && finalScore !== existing.score) {
      await updateProductScore(existing.id, finalScore);
    }
    return {
      source: "database",
      product: { ...existing, score: finalScore ?? existing.score },
      ingredients: toIngredientDetails(ingredients),
      concerns: buildConcerns(ingredients),
      submissionPrompt: null,
      submission: null,
    };
  }

  // TEMP: comment out OBF to test INCI fallback — revert when done
  const obf = await fetchObfByBarcode(trimmed);
  // const obf = null;
  let inci: InciProductLookup | null = null;
  const obfHasIngredients = Boolean(obf?.product.ingredients_list?.trim());
  if (!obfHasIngredients) {
    inci = await fetchInciProductByBarcode(trimmed);
  }

  const lookupIngredients = collectLookupIngredients(obf, inci);
  if (lookupIngredients.length > 0) {
    await flagMissingLookupIngredients(lookupIngredients);
  }

  const { submissionId, scanCount } = await recordMissedScanFromLookup(
    trimmed,
    userId,
    obf,
    inci,
  );

  const submissionMeta = { id: submissionId, scan_count: scanCount };

  if (obf) {
    return {
      source: "open_beauty_facts",
      product: obf.product,
      ingredients: obf.ingredients,
      // OBF ingredients are unclassified, so no microbiome concerns yet.
      concerns: [],
      submissionPrompt: {
        message:
          "Product found via Open Beauty Facts but not in our catalog. You may submit it for review.",
        submitFunction: SUBMIT_FN,
      },
      submission: submissionMeta,
    };
  }

  if (inci?.ingredients) {
    return {
      source: "inci_api",
      product: {
        id: "00000000-0000-0000-0000-000000000000",
        barcode: trimmed,
        product_name: inci.product_name,
        brand: inci.brand,
        category: inci.category,
        size_count: null,
        absorbency: null,
        ingredients_list: inci.ingredients,
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
        image_url: inci.image_url,
        score: null,
        source_url: null,
        verified: false,
      },
      ingredients: [],
      concerns: [],
      submissionPrompt: {
        message:
          "Product found via INCI API but not in our catalog. It has been queued for review.",
        submitFunction: SUBMIT_FN,
      },
      submission: submissionMeta,
    };
  }

  return {
    source: "not_found",
    product: null,
    ingredients: [],
    concerns: [],
    submissionPrompt: {
      message:
        "Product not found. It has been queued for review.",
      submitFunction: SUBMIT_FN,
    },
    submission: submissionMeta,
  };
}
