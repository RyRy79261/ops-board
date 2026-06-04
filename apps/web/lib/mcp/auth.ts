import {
  findActiveAccessToken,
  touchAccessToken,
  MCP_PRINCIPAL_ID,
} from "@opsboard/db/mcp";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { sha256 } from "./tokens";

// ADAPTED from camp-404 apps/web/lib/mcp/auth.ts (scaffolding-plan.md S6),
// stripped to single-principal. Camp bound each token to a `users.id`
// (`campUserId`); OpsBoard has no users table, so the principal is always the
// constant MCP_PRINCIPAL_ID ("owner"). The token row carries a nullable
// `principalId` for audit attribution, but auth never branches on the
// identity — a valid (unexpired, unrevoked) token IS the owner.

/**
 * Bearer-token verifier passed to `withMcpAuth`. Hashes the presented token,
 * looks it up in `mcp_access_tokens` (non-revoked, non-expired), and returns
 * the standard MCP `AuthInfo` shape. Returning `undefined` makes
 * `withMcpAuth` respond with 401 + the WWW-Authenticate hint.
 *
 * The principal id is stuffed into `extra.principalId` so tool handlers can
 * read `extra.authInfo?.extra?.principalId` without an extra DB hop — though
 * for the single-user model it always resolves to MCP_PRINCIPAL_ID.
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
      principalId: row.principalId ?? MCP_PRINCIPAL_ID,
      scope: row.scope,
    },
  };
}

/**
 * Pull the principal id out of an `AuthInfo.extra` blob. Falls back to the
 * single-user constant — a present, valid token always maps to the owner.
 */
export function getPrincipalIdFromAuth(
  authInfo: AuthInfo | undefined,
): string {
  const id = (authInfo?.extra as { principalId?: unknown } | undefined)
    ?.principalId;
  return typeof id === "string" ? id : MCP_PRINCIPAL_ID;
}
