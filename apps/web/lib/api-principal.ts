import "server-only";

import {
  findActiveClientApiKeyByHash,
  touchClientApiKey,
} from "@opsboard/db/client-api-keys";
import { getAuthenticatedUser } from "@/lib/auth";
import { sha256 } from "@/lib/mcp/tokens";
import { CLIENT_KEY_PREFIX } from "@/lib/client-key";

// The /api/v1 principal seam — ONE resolver that accepts either transport-
// native credential and returns the same principal shape, so v1 route handlers
// never care how the caller authenticated:
//
//   - `Authorization: Bearer opsb_…`  → a programmatic client API key
//     (client_api_keys; hash lookup, mirrors verifyMcpToken — the plaintext is
//     hashed and immediately discarded, never logged or stored).
//   - otherwise                        → the Neon Auth cookie session (the
//     same getAuthenticatedUser the voice routes use).
//
// The resolved userId is ALWAYS server-verified — from the key row's owner or
// the verified session — never from client input. MCP stays on its own bearer
// path (verifyMcpToken); this seam is REST + browser only.

export { CLIENT_KEY_PREFIX };

export interface ApiPrincipal {
  userId: string;
  via: "session" | "api-key";
  /** The authenticating key's row id (audit attribution), when via = api-key. */
  keyId?: string;
  /** The key's operator-facing name (audit attribution), when via = api-key. */
  keyName?: string;
}

/**
 * Resolve the caller of a /api/v1 request. Returns null when neither
 * credential verifies (the route answers 401). An `opsb_` bearer that fails
 * verification is a hard null — it never falls back to the cookie session, so
 * a revoked key can't silently ride an ambient browser session.
 */
export async function resolveApiPrincipal(
  req: Request,
): Promise<ApiPrincipal | null> {
  const authz = req.headers.get("authorization");
  if (authz?.toLowerCase().startsWith("bearer ")) {
    const token = authz.slice("bearer ".length).trim();
    if (token.startsWith(CLIENT_KEY_PREFIX)) {
      const row = await findActiveClientApiKeyByHash(sha256(token));
      if (!row) return null;
      // Best-effort last_used_at — never blocks the request.
      void touchClientApiKey(row.id);
      return {
        userId: row.userId,
        via: "api-key",
        keyId: row.id,
        keyName: row.name,
      };
    }
    // A Bearer credential we don't recognise is a failed authentication, not
    // an anonymous request — fail closed rather than falling through.
    return null;
  }

  const user = await getAuthenticatedUser();
  if (!user) return null;
  return { userId: user.id, via: "session" };
}
