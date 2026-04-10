import { assertAdmin } from "../_shared/services/admin/guard.ts";
import {
  approveSubmission,
  listFlaggedIngredients,
  listPendingSubmissions,
  rejectSubmission,
  updateFlaggedIngredientStatus,
} from "../_shared/services/admin/repository.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson, requireMethod } from "../_shared/http.ts";

/**
 * Single admin Edge Function; route with query params (Supabase has one URL per function).
 *
 * GET  ?resource=flagged-ingredients
 * PUT  ?resource=flagged-ingredients&id=<uuid>  body: { "status": "..." }
 * GET  ?resource=submissions
 * POST ?resource=submissions&action=approve&id=<uuid>
 * POST ?resource=submissions&action=reject&id=<uuid>  body optional { "review_notes": "..." }
 *
 * Header: x-admin-secret: <ADMIN_SECRET>
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

  try {
    if (req.method === "GET" && resource === "flagged-ingredients") {
      const rows = await listFlaggedIngredients();
      return jsonOk(rows);
    }

    if (req.method === "GET" && resource === "submissions") {
      const rows = await listPendingSubmissions();
      return jsonOk(rows);
    }

    if (req.method === "PUT" && resource === "flagged-ingredients") {
      const id = url.searchParams.get("id");
      if (!id) return jsonError("Query id is required", 400);
      const body = await readJson<{ status: string }>(req);
      if (!body?.status) return jsonError("Body must include status", 400);
      await updateFlaggedIngredientStatus(id, body.status);
      return jsonOk({ updated: true });
    }

    if (req.method === "POST" && resource === "submissions") {
      const action = url.searchParams.get("action");
      const id = url.searchParams.get("id");
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

    return jsonError(
      "Unsupported method/resource. See docs/api/06-admin.md",
      400,
    );
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : String(e), 400);
  }
});
