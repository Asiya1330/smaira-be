import type { ProductScoreResponse } from "../../types/api.ts";
import { toIngredientDetails } from "../ingredients/repository.ts";
import { listIngredientsForProduct } from "../ingredients/repository.ts";
import { computeProductScore } from "../scoring/engine.ts";
import { ratingForScoreAsync } from "../scoring/rating.ts";
import { findProductById, updateProductScore } from "./repository.ts";

/**
 * README Steps 2–6: load ingredients, compute score, persist, return API shape.
 */
export async function scoreProductById(
  productId: string,
): Promise<ProductScoreResponse> {
  const product = await findProductById(productId);
  if (!product) throw new Error("Product not found");

  const ingredients = await listIngredientsForProduct(productId);
  const computation = computeProductScore(ingredients);

  let rating = computation.rating;
  if (computation.finalScore !== null) {
    rating = await ratingForScoreAsync(computation.finalScore);
    await updateProductScore(productId, computation.finalScore);
  }

  return {
    product: {
      product_name: product.product_name ?? product.name ?? "Unknown product",
      brand: product.brand,
      category: product.category,
      image_url: product.image_url,
      score: computation.finalScore,
      rating,
    },
    // ingredients: toIngredientDetails(ingredients),
    summary: computation.summary
  };
}
