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

/** Optional: INCI API (inciapi.com) for ingredient lookup on missed scans. */
export function getInciApiKey(): string | undefined {
  return Deno.env.get("INCI_API_KEY")?.trim() || undefined;
}

export function getAnthropicApiKey(): string {
  const v = Deno.env.get("ANTHROPIC_API_KEY")?.trim()
  if (!v) {
    throw new Error("Missing required environment variable: ANTHROPIC_API_KEY");
  }
  return v;
}

/** Default when `CLAUDE_MODEL` is unset. Update when Anthropic retires models. */
export const DEFAULT_CLAUDE_MODEL = "claude-sonnet-4-6";

/** Claude model for ingredient scoring (`ingredients-score`). Override via `CLAUDE_MODEL`. */
export function getClaudeModel(): string {
  return Deno.env.get("CLAUDE_MODEL")?.trim() || DEFAULT_CLAUDE_MODEL;
}
