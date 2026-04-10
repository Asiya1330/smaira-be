import { createClient, type User } from "@supabase/supabase-js";
import { getAnonKey, getSupabaseUrl } from "../config/env.ts";

/**
 * Resolves the authenticated user from the request Authorization header.
 * Uses the anon key + JWT (Supabase Auth); does not use the service role.
 */
export async function getUserFromRequest(
  req: Request,
): Promise<{ user: User | null; error: string | null }> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { user: null, error: "Missing or invalid Authorization header" };
  }
  const supabase = createClient(getSupabaseUrl(), getAnonKey(), {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error) return { user: null, error: error.message };
  return { user, error: null };
}
