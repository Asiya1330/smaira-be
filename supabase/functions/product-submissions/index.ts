import { getUserFromRequest } from "../_shared/supabase/user-context.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, readJson, requireMethod } from "../_shared/http.ts";
import { createSubmission } from "../_shared/services/submissions/repository.ts";

type Body = {
  product_name: string;
  brand?: string | null;
  barcode: string;
  category?: string | null;
  image_url?: string | null;
  ingredients?: string | null;
};

/**
 * POST /functions/v1/product-submissions
 * README § Product submission (auth required for userId)
 */
serveWithCors(async (req) => {
  const bad = requireMethod(req, ["POST"]);
  if (bad) return jsonError(bad, 405);

  const { user, error: authError } = await getUserFromRequest(req);
  if (!user) return jsonError(authError ?? "Unauthorized", 401);

  try {
    const body = await readJson<Body>(req);
    if (!body?.product_name || !body?.barcode) {
      return jsonError("product_name and barcode are required", 400);
    }
    const { id } = await createSubmission({
      user_id: user.id,
      product_name: body.product_name,
      brand: body.brand,
      barcode: body.barcode,
      category: body.category,
      image_url: body.image_url,
      ingredients: body.ingredients,
    });
    return jsonOk({ id, status: "pending" }, 201);
  } catch (e) {
    return jsonError(e instanceof Error ? e.message : String(e), 400);
  }
});
