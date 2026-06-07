import { findActiveAccessToken, touchAccessToken } from "@opsboard/db/mcp";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { sha256 } from "./tokens";

// ADAPTED from camp-404 apps/web/lib/mcp/auth.ts (scaffolding-plan.md S6). MCP
// is per-user: each access token row carries the `user_id` of the human who
// authorized it. The verifier stuffs that id into `extra.userId` so tool
// handlers scope every db call to the token's owner without an extra DB hop —
// the userId is ALWAYS the one bound to the verified token, never client input.

/**
 * Bearer-token verifier passed to `withMcpAuth`. Hashes the presented token,
 * looks it up in `mcp_access_tokens` (non-revoked, non-expired), and returns
 * the standard MCP `AuthInfo` shape. Returning `undefined` makes
 * `withMcpAuth` respond with 401 + the WWW-Authenticate hint.
 *
 * The token's authorizing `user_id` is stuffed into `extra.userId` so tool
 * handlers can read `getUserIdFromAuth(extra.authInfo)` and scope their reads /
 * mutations to that user.
 */
export async function verifyMcpToken(
  _req: Request,
  bearerToken?: string,
): Promise<AuthInfo | undefined> {
  if (!bearerToken) return undefined;
  const hash = sha256(bearerToken);
  const row = await findActiveAccessToken(hash);
  if (!row) return undefined;

  // Best-effort housekeeping (last_used_at) — don't await; never block the
  // tool call on this.
  void touchAccessToken(hash);

  return {
    token: bearerToken,
    clientId: row.clientId,
    scopes: row.scope.split(/\s+/).filter(Boolean),
    expiresAt: Math.floor(row.expiresAt.getTime() / 1000),
    extra: {
      // The authorizing user's id — the principal every tool scopes against.
      userId: row.userId,
      scope: row.scope,
    },
  };
}

/**
 * Pull the authorizing user id out of an `AuthInfo.extra` blob. Returns null
 * when absent — callers MUST treat that as unauthenticated (a valid token
 * always carries a userId, so a missing one is a hard failure, not a default).
 */
export function getUserIdFromAuth(
  authInfo: AuthInfo | undefined,
): string | null {
  const id = (authInfo?.extra as { userId?: unknown } | undefined)?.userId;
  return typeof id === "string" && id.length > 0 ? id : null;
}
