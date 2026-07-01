import { assertAdmin } from "../_shared/services/admin/guard.ts";
import { scoreAndFlagIngredients } from "../_shared/services/ingredient-scoring/orchestrator.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson, requireMethod } from "../_shared/http.ts";

type Body = {
  ingredients: string[];
  prompt?: string;
  product_name?: string;
  product_category?: string;
  barcode?: string;
  user_id?: string;
  /** Optional product UUIDs stored on each new `flagged_ingredients` row. */
  product_ids?: string[];
};

/**
 * POST /functions/v1/ingredients-score
 * Scores ingredients via Claude, inserts `flagged_ingredients`, returns scores.
 * Auth: `x-admin-secret` (same as `admin`).
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
    const body = await readJson<Body>(req);
    if (!Array.isArray(body?.ingredients)) {
      return jsonError("Body must include ingredients (string array)", 400);
    }
    const data = await scoreAndFlagIngredients({
      ingredients: body.ingredients,
      prompt: body.prompt,
      productName: body.product_name,
      productCategory: body.product_category,
      barcode: body.barcode,
      userId: body.user_id,
      product_ids: body.product_ids,
    });
    return jsonOk(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonError(message, 400);
  }
});
