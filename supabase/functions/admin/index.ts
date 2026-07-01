import { assertAdmin } from "../_shared/services/admin/guard.ts";
import {
  deleteIngredient,
  deleteProduct,
  listIngredientsForAdmin,
  listProductsForAdmin,
  parseUpdateProductPatch,
  updateProduct,
} from "../_shared/services/admin/catalog.ts";
import {
  approveFlaggedIngredient,
  rejectFlaggedIngredient,
} from "../_shared/services/admin/flagged-actions.ts";
import { scoreAllProducts } from "../_shared/services/admin/score-all.ts";
import {
  approveSubmission,
  createIngredient,
  listFlaggedIngredients,
  listPendingSubmissions,
  parseCreateIngredientBody,
  parseUpdateIngredientPatch,
  rejectSubmission,
  syncNoDataIngredientsToFlagged,
  updateFlaggedIngredientStatus,
  updateIngredient,
} from "../_shared/services/admin/repository.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson } from "../_shared/http.ts";

/**
 * Admin Edge Function — all routes require `x-admin-secret`.
 *
 * GET  ?resource=products
 * GET  ?resource=ingredients
 * PATCH ?resource=products&id=<uuid>
 * DELETE ?resource=products&id=<uuid>
 * POST ?resource=products&action=score-all   (recompute & persist every product score)
 *
 * GET  ?resource=flagged-ingredients
 * PUT  ?resource=flagged-ingredients&id=<uuid>  body: { status }
 * POST ?resource=flagged-ingredients&action=sync-no-data
 * POST ?resource=flagged-ingredients&action=approve&id=<uuid>
 * POST ?resource=flagged-ingredients&action=reject&id=<uuid>
 *
 * GET  ?resource=submissions
 * POST ?resource=submissions&action=approve&id=<uuid>
 * POST ?resource=submissions&action=reject&id=<uuid>
 *
 * POST ?resource=ingredients
 * PATCH ?resource=ingredients&id=<uuid>
 * DELETE ?resource=ingredients&id=<uuid>
 */
serveWithCors(async (req) => {
  try {
    assertAdmin(req);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const code = msg === "Unauthorized" ? 401 : 400;
    return jsonError(msg, code);
  }

  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const id = url.searchParams.get("id");
  const action = url.searchParams.get("action");

  try {
    if (req.method === "GET" && resource === "products") {
      return jsonOk(await listProductsForAdmin());
    }

    if (req.method === "GET" && resource === "ingredients") {
      return jsonOk(await listIngredientsForAdmin());
    }

    if (req.method === "PATCH" && resource === "products") {
      if (!id) return jsonError("Query id is required", 400);
      let patch;
      try {
        patch = parseUpdateProductPatch(await readJson<unknown>(req));
      } catch (e) {
        return jsonError(e instanceof Error ? e.message : String(e), 400);
      }
      const product = await updateProduct(id, patch);
      return jsonOk({ updated: true, product });
    }

    if (req.method === "DELETE" && resource === "products") {
      if (!id) return jsonError("Query id is required", 400);
      await deleteProduct(id);
      return jsonOk({ deleted: true });
    }

    if (req.method === "POST" && resource === "products") {
      if (action === "score-all") {
        return jsonOk(await scoreAllProducts());
      }
      return jsonError("Query action must be score-all", 400);
    }

    if (req.method === "GET" && resource === "flagged-ingredients") {
      return jsonOk(await listFlaggedIngredients());
    }

    if (req.method === "PUT" && resource === "flagged-ingredients") {
      if (!id) return jsonError("Query id is required", 400);
      const body = await readJson<{ status: string }>(req);
      if (!body?.status) return jsonError("Body must include status", 400);
      await updateFlaggedIngredientStatus(id, body.status);
      return jsonOk({ updated: true });
    }

    if (req.method === "POST" && resource === "flagged-ingredients") {
      if (action === "sync-no-data") {
        const result = await syncNoDataIngredientsToFlagged();
        return jsonOk({
          synced: true,
          inserted: result.inserted,
          updated: result.updated,
          no_data_ingredient_count: result.no_data_ingredient_count,
        });
      }
      if (action === "approve") {
        if (!id) return jsonError("Query id is required", 400);
        const result = await approveFlaggedIngredient(id);
        return jsonOk({ approved: true, ...result });
      }
      if (action === "reject") {
        if (!id) return jsonError("Query id is required", 400);
        await rejectFlaggedIngredient(id);
        return jsonOk({ rejected: true });
      }
      return jsonError(
        "Query action must be sync-no-data, approve, or reject",
        400,
      );
    }

    if (req.method === "GET" && resource === "submissions") {
      return jsonOk(await listPendingSubmissions());
    }

    if (req.method === "POST" && resource === "submissions") {
      if (!id) return jsonError("Query id is required", 400);
      if (action === "approve") {
        const product = await approveSubmission(id);
        return jsonOk({ approved: true, product });
      }
      if (action === "reject") {
        let notes: string | undefined;
        try {
          const b = await readJson<{ review_notes?: string }>(req);
          notes = b?.review_notes;
        } catch {
          // empty body
        }
        await rejectSubmission(id, notes);
        return jsonOk({ rejected: true });
      }
      return jsonError("Query action must be approve or reject", 400);
    }

    if (req.method === "POST" && resource === "ingredients") {
      const raw = await readJson<unknown>(req);
      let input;
      try {
        input = parseCreateIngredientBody(raw);
      } catch (e) {
        return jsonError(e instanceof Error ? e.message : String(e), 400);
      }
      const ingredient = await createIngredient(input);
      return jsonOk({ created: true, ingredient }, 201);
    }

    if (req.method === "PATCH" && resource === "ingredients") {
      if (!id) return jsonError("Query id is required", 400);
      let patch;
      try {
        patch = parseUpdateIngredientPatch(await readJson<unknown>(req));
      } catch (e) {
        return jsonError(e instanceof Error ? e.message : String(e), 400);
      }
      const ingredient = await updateIngredient(id, patch);
      return jsonOk({ updated: true, ingredient });
    }

    if (req.method === "DELETE" && resource === "ingredients") {
      if (!id) return jsonError("Query id is required", 400);
      await deleteIngredient(id);
      return jsonOk({ deleted: true });
    }

    return jsonError(
      "Unsupported method/resource. See docs/api/06-admin.md",
      400,
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const status = message.includes("not found") ? 404 : 400;
    return jsonError(message, status);
  }
});
