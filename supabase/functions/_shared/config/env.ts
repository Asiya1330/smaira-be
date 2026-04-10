function required(key: string): string {
  const v = Deno.env.get(key);
  if (!v) throw new Error(`Missing required environment variable: ${key}`);
  return v;
}

export function getSupabaseUrl(): string {
  return required("SUPABASE_URL");
}

/** Service role — server-side only; never expose to clients. */
export function getServiceRoleKey(): string {
  return required("SUPABASE_SERVICE_ROLE_KEY");
}

/** Anon key — used with the caller's JWT to resolve auth.getUser(). */
export function getAnonKey(): string {
  return required("SUPABASE_ANON_KEY");
}

/** Optional: protect admin routes when not using JWT role claims. */
export function getAdminSecret(): string | undefined {
  return Deno.env.get("ADMIN_SECRET") ?? undefined;
}
