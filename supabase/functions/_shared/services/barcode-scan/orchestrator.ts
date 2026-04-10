import type { BarcodeScanResponse } from "../../types/api.ts";
import {
  listIngredientsForProduct,
  toIngredientDetails,
} from "../ingredients/repository.ts";
import { fetchObfByBarcode } from "../open-beauty-facts/client.ts";
import { findProductByBarcode } from "../products/repository.ts";

const SUBMIT_FN = "product-submissions";

/**
 * README Step 1: DB → Open Beauty Facts → submission prompt.
 */
export async function runBarcodeScan(barcode: string): Promise<BarcodeScanResponse> {
  const trimmed = barcode.trim();
  if (!trimmed) {
    throw new Error("barcode is required");
  }

  const existing = await findProductByBarcode(trimmed);
  if (existing?.id) {
    const ingredients = await listIngredientsForProduct(existing.id);
    return {
      source: "database",
      product: existing,
      ingredients: toIngredientDetails(ingredients),
      submissionPrompt: null,
    };
  }

  const obf = await fetchObfByBarcode(trimmed);
  if (obf) {
    return {
      source: "open_beauty_facts",
      product: obf,
      ingredients: [],
      submissionPrompt: {
        message:
          "Product found via Open Beauty Facts but not in our catalog. You may submit it for review.",
        submitFunction: SUBMIT_FN,
      },
    };
  }

  return {
    source: "not_found",
    product: null,
    ingredients: [],
    submissionPrompt: {
      message:
        "Product not found. Submit details so our team can review and add it.",
      submitFunction: SUBMIT_FN,
    },
  };
}
