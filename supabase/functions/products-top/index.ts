import { findTopProductsByCategory } from "../_shared/services/products/repository.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, requireMethod } from "../_shared/http.ts";

const DEFAULT_LIMIT = 3;
const MAX_LIMIT = 50;

/**
 * GET /functions/v1/products-top?category=...&limit=3
 * Returns the top-scoring products in a category (highest score first).
 * `limit` is optional (default 3, max 50). Public read endpoint.
 */
serveWithCors(async (req) => {
  const bad = requireMethod(req, ["GET"]);
  if (bad) return jsonError(bad, 405);

  const url = new URL(req.url);
  const category = url.searchParams.get("category")?.trim();
  if (!category) {
    return jsonError("Query parameter `category` is required", 400);
  }

  const limit = parseLimit(url.searchParams.get("limit"));
  if (limit === null) {
    return jsonError("`limit` must be an integer between 1 and 50", 400);
  }

  try {
    const products = await findTopProductsByCategory(category, limit);
    return jsonOk({ category, count: products.length, products });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonError(message, 400);
  }
});

function parseLimit(raw: string | null): number | null {
  if (raw == null || raw.trim() === "") return DEFAULT_LIMIT;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > MAX_LIMIT) return null;
  return n;
}
