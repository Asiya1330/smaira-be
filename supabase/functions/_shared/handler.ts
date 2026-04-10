import { corsHeaders } from "./cors.ts";
import { jsonError } from "./http.ts";

type Handler = (req: Request) => Promise<Response>;

/**
 * Wraps an Edge Function handler with OPTIONS + centralized error handling.
 */
export function serveWithCors(handler: Handler) {
  Deno.serve(async (req) => {
    if (req.method === "OPTIONS") {
      return new Response("ok", { headers: corsHeaders });
    }
    try {
      return await handler(req);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      return jsonError(message, 500);
    }
  });
}
