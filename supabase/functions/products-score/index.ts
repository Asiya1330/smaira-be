import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, requireMethod } from "../_shared/http.ts";
import { scoreProductById } from "../_shared/services/products/score-flow.ts";

/**
 * GET /functions/v1/products-score?productId=<uuid>
 * README § API — Product scoring
 */
serveWithCors(async (req) => {
  const bad = requireMethod(req, ["GET"]);
  if (bad) return jsonError(bad, 405);

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) {
    return jsonError("Query parameter `productId` is required", 400);
  }

  try {
    const data = await scoreProductById(productId);
    return jsonOk(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = message === "Product not found" ? 404 : 400;
    return jsonError(message, status);
  }
});
