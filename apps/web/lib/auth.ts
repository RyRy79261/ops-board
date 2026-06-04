import "server-only";

// SINGLE-USER stub — collapses camp-404's per-user Neon-Auth gate
// (apps/web/lib/auth.ts) to one constant principal (project_brief.md §0/§3:
// "single-user personal tool"). The camp route guard ladder
// (auth → rate-limit → validate → scrub) is preserved by the voice routes;
// only the auth step is degenerate here. Rate-limiting is KEPT and keyed on
// this principal + the client IP.
//
// TODO(auth): if OpsBoard ever gains real session auth, replace this with the
// session reader (cookie/JWT) and return null for unauthenticated requests —
// the route's `if (!user) 401` branch already handles that shape. Until then
// the principal is always present, so the board is effectively open; deploy
// behind a platform-level access gate (e.g. Vercel password protection) if it
// must not be public.

/** Mirrors the MCP single-principal id (@opsboard/db/mcp MCP_PRINCIPAL_ID). */
export const PRINCIPAL_ID = "owner" as const;

/** The minimal principal shape the voice routes rate-limit + audit against. */
export interface Principal {
  id: string;
}

/**
 * The single-user principal. Always resolves (never null) because OpsBoard has
 * no users table. Kept `async` so the call-site shape matches camp's
 * `await getAuthenticatedUser()` and a future real implementation can drop in
 * without touching the routes.
 */
export async function getAuthenticatedUser(): Promise<Principal | null> {
  return { id: PRINCIPAL_ID };
}
