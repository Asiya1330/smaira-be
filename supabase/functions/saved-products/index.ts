import { getUserFromRequest } from "../_shared/supabase/user-context.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson } from "../_shared/http.ts";
import {
  listSavedForUser,
  removeSaved,
  saveProduct,
} from "../_shared/services/saved-products/repository.ts";

type SaveBody = { product_id: string };

/**
 * GET /functions/v1/saved-products — list saved (Authorization: Bearer JWT)
 * POST /functions/v1/saved-products — body { product_id }
 * DELETE /functions/v1/saved-products?productId=<uuid>
 */
serveWithCors(async (req) => {
  const { user, error: authError } = await getUserFromRequest(req);
  if (!user) return jsonError(authError ?? "Unauthorized", 401);

  if (req.method === "GET") {
    try {
      const data = await listSavedForUser(user.id);
      return jsonOk(data);
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : String(e), 400);
    }
  }

  if (req.method === "POST") {
    try {
      const body = await readJson<SaveBody>(req);
      if (!body?.product_id) {
        return jsonError("Body must include product_id", 400);
      }
      await saveProduct(user.id, body.product_id);
      return jsonOk({ saved: true });
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : String(e), 400);
    }
  }

  if (req.method === "DELETE") {
    const productId = new URL(req.url).searchParams.get("productId");
    if (!productId) {
      return jsonError("Query parameter `productId` is required", 400);
    }
    try {
      await removeSaved(user.id, productId);
      return jsonOk({ deleted: true });
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : String(e), 400);
    }
  }

  return jsonError("Method not allowed", 405);
});
