import { getAdminSecret } from "../../config/env.ts";

/**
 * Validates admin access via `x-admin-secret` header matching `ADMIN_SECRET` env.
 * Replace with JWT role checks when you add admin roles in Supabase Auth.
 */
export function assertAdmin(req: Request): void {
  const secret = getAdminSecret();
  if (!secret) {
    throw new Error("ADMIN_SECRET is not configured on this project");
  }
  const header = req.headers.get("x-admin-secret");
  if (header !== secret) {
    throw new Error("Unauthorized");
  }
}
