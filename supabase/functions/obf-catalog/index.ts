import { assertAdmin } from "../_shared/services/admin/guard.ts";
import { fetchObfCatalogByProbayaCategories } from "../_shared/services/open-beauty-facts/category-client.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson, requireMethod } from "../_shared/http.ts";

type Body = {
  /**
   * Probaya categories to fetch. Each entry is a string or `{ category: "tampon" }`.
   * Omit to use the default 10 app categories.
   */
  categories?: Array<string | { category: string }>;
  /** Max products per OBF page (default 100). */
  page_size?: number;
};

/**
 * POST /functions/v1/obf-catalog
 * Fetches Open Beauty Facts products grouped by Probaya category.
 * Maps each product to `products` table columns only (no DB insert).
 * Auth: `x-admin-secret`.
 */
serveWithCors(async (req) => {
  const bad = requireMethod(req, ["POST"]);
  if (bad) return jsonError(bad, 405);

  try {
    assertAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = msg === "Unauthorized" ? 401 : 400;
    return jsonError(msg, code);
  }

  try {
    let body: Body = {};
    try {
      body = await readJson<Body>(req);
    } catch {
      // empty body → default categories
    }

    const data = await fetchObfCatalogByProbayaCategories({
      categories: body?.categories,
      page_size: body?.page_size,
    });
    return jsonOk(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonError(message, 400);
  }
});
