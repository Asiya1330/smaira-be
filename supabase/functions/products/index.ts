import { supabase } from "../_shared/supabaseClient.ts";
import { successResponse, errorResponse } from "../_shared/response.ts";
import { corsHeaders } from "../_shared/corsHeaders.ts";

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // GET - fetch all products
    if (req.method === "GET") {
      const url = new URL(req.url);
      const id = url.searchParams.get("id");

      if (id) {
        const { data, error } = await supabase
          .from("products")
          .select("*, ingredients(*)")
          .eq("id", id)
          .single();

        if (error) return errorResponse(error.message, 404);
        return successResponse(data);
      }

      const { data, error } = await supabase
        .from("products")
        .select("*");

      if (error) return errorResponse(error.message);
      return successResponse(data);
    }

    // POST - create product
    if (req.method === "POST") {
      const body = await req.json();

      const { data, error } = await supabase
        .from("products")
        .insert(body)
        .select()
        .single();

      if (error) return errorResponse(error.message);
      return successResponse(data, 201);
    }

    return errorResponse("Method not allowed", 405);

  } catch (err) {
    return errorResponse(err.message, 500);
  }
});