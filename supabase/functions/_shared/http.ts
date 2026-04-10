import { corsHeaders } from "./cors.ts";

const jsonHeaders = {
  ...corsHeaders,
  "Content-Type": "application/json",
};

export function jsonOk<T>(data: T, status = 200): Response {
  return new Response(JSON.stringify({ success: true, data }), {
    status,
    headers: jsonHeaders,
  });
}

export function jsonError(message: string, status = 400): Response {
  return new Response(JSON.stringify({ success: false, error: message }), {
    status,
    headers: jsonHeaders,
  });
}

export function preflight(): Response {
  return new Response("ok", { headers: corsHeaders });
}

export async function readJson<T>(req: Request): Promise<T> {
  return (await req.json()) as T;
}

export function requireMethod(req: Request, allowed: string[]): string | null {
  if (!allowed.includes(req.method)) {
    return `Method ${req.method} not allowed`;
  }
  return null;
}
