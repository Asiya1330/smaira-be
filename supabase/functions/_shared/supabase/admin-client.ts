import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { getServiceRoleKey, getSupabaseUrl } from "../config/env.ts";

let _admin: SupabaseClient | null = null;

/** Service-role client (bypasses RLS). Use only after authorization checks. */
export function getAdminClient(): SupabaseClient {
  if (!_admin) {
    _admin = createClient(getSupabaseUrl(), getServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return _admin;
}
