import { corsHeaders } from "./corsHeaders.ts";

export const successResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

export const errorResponse = (message: string, status = 400) =>
  new Response(JSON.stringify({ success: false, message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });