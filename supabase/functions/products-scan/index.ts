import { runBarcodeScan } from "../_shared/services/barcode-scan/orchestrator.ts";
import { serveWithCors } from "../_shared/handler.ts";
import { jsonError, jsonOk, requireMethod } from "../_shared/http.ts";

/**
 * GET /functions/v1/products-scan?barcode=...
 * README § API — Barcode scanning
 */
serveWithCors(async (req) => {
  const bad = requireMethod(req, ["GET"]);
  if (bad) return jsonError(bad, 405);

  const barcode = new URL(req.url).searchParams.get("barcode");
  if (!barcode) {
    return jsonError("Query parameter `barcode` is required", 400);
  }

  try {
    const data = await runBarcodeScan(barcode);
    return jsonOk(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return jsonError(message, 400);
  }
});
