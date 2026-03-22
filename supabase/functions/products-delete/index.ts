import { supabase } from "../_shared/supabaseClient.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";
import { corsHeaders } from "../_shared/corsHeaders.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    if (req.method === "DELETE") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (!id) return errorResponse("ID is required", 400);

      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", id);

      if (error) return errorResponse(error.message);
      return successResponse({ message: "Deleted successfully" });
    }

    return errorResponse("Method not allowed", 405);

  } catch (err) {
    return errorResponse(err.message, 500);
  }
});