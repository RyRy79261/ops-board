import { and, eq, gt, isNull } from "drizzle-orm";
import { createHttpDb } from "./index";
import * as schema from "./schema";

// @opsboard/db/mcp — the server-only MCP auth-state helpers the S6 OAuth
// shell depends on (`appendMcpAuditLog`, token lookup/touch). OpsBoard is
// MULTI-USER: every auth code / access token / audit row carries the `user_id`
// of the human who authorized the MCP client (the verified Neon Auth session
// captured in the authorize route), and the audit log's `principal_id` mirrors
// that id. An UNAUTHENTICATED tool-call rejection is attributed to NULL (no
// principal) — never to a constant placeholder, which would falsely pin
// anonymous traffic to a real-looking actor.

/** Append one row to mcp_audit_log. Best-effort — never throws into the caller. */
export async function appendMcpAuditLog(input: {
  principalId?: string | null;
  clientId: string;
  tool: string;
  argsJson: Record<string, unknown> | null;
  outcome: "success" | "error";
  errorMessage?: string | null;
  durationMs?: number | null;
}): Promise<void> {
  try {
    const db = createHttpDb();
    await db.insert(schema.mcpAuditLog).values({
      // Attribute to the real authorizing user, or NULL when there is none
      // (e.g. an unauthenticated rejection) — never a constant placeholder.
      principalId: input.principalId ?? null,
      clientId: input.clientId,
      tool: input.tool,
      argsJson: input.argsJson,
      outcome: input.outcome,
      errorMessage: input.errorMessage ?? null,
      durationMs: input.durationMs ?? null,
    });
  } catch {
    // Auditing must never break a tool call. Swallow + rely on DB-level
    // monitoring for persistent audit-log write failures.
  }
}

/** Bump `mcp_oauth_clients.last_used_at` and `mcp_access_tokens.last_used_at`. */
export async function touchAccessToken(tokenHash: string): Promise<void> {
  try {
    const db = createHttpDb();
    const now = new Date();
    const [token] = await db
      .update(schema.mcpAccessTokens)
      .set({ lastUsedAt: now })
      .where(eq(schema.mcpAccessTokens.tokenHash, tokenHash))
      .returning({ clientId: schema.mcpAccessTokens.clientId });
    if (token) {
      await db
        .update(schema.mcpOauthClients)
        .set({ lastUsedAt: now })
        .where(eq(schema.mcpOauthClients.clientId, token.clientId));
    }
  } catch {
    // Best-effort housekeeping.
  }
}

/**
 * Find a non-revoked, non-expired access token by its SHA-256 hash.
 * Returns null when the hash is unknown / expired / revoked.
 */
export async function findActiveAccessToken(
  tokenHash: string,
): Promise<schema.McpAccessToken | null> {
  const db = createHttpDb();
  const [row] = await db
    .select()
    .from(schema.mcpAccessTokens)
    .where(
      and(
        eq(schema.mcpAccessTokens.tokenHash, tokenHash),
        isNull(schema.mcpAccessTokens.revokedAt),
        gt(schema.mcpAccessTokens.expiresAt, new Date()),
      ),
    )
    .limit(1);
  return row ?? null;
}
