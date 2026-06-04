import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { AuthInfo } from "@modelcontextprotocol/sdk/server/auth/types.js";
import { appendMcpAuditLog } from "@opsboard/db/mcp";
import { getUserIdFromAuth } from "./auth";

// ADAPTED from camp-404 apps/web/lib/mcp/tool-utils.ts (scaffolding-plan.md
// S6). `runTool` lives HERE (not server.ts) and wraps EVERY tool handler with
// the two cross-cutting guarantees that must never be skipped
// (research-dossier §9): (1) audit logging via appendMcpAuditLog and (2)
// generic error masking so a tool never leaks SQL / stack traces to the
// caller. Per-user: the bearer token (verified upstream by `withMcpAuth` →
// verifyMcpToken) carries the authorizing user's id; runTool extracts it
// (getUserIdFromAuth) and hands it to the handler, which scopes every db call
// to it. A token with no userId is rejected before the handler runs.

/**
 * The context every tool handler receives. `clientId` is what we audit-log
 * against; `userId` is the verified authorizing user the token is bound to —
 * every scoped db read / mutation in a handler uses it.
 */
export interface ToolCtx {
  userId: string;
  clientId: string;
}

/**
 * Standard `extra` object shape passed by mcp-handler / the MCP SDK. We only
 * care about `authInfo` here.
 */
export interface ToolExtra {
  authInfo?: AuthInfo;
}

/**
 * Body wrapper every tool handler uses:
 *   1. Resolve the principal id + client id from the auth info.
 *   2. Run the handler under try/catch.
 *   3. Audit-log success or failure with duration + redacted args
 *      (fire-and-forget shape — appendMcpAuditLog never throws into us).
 *   4. Stringify the result into a CallToolResult.
 *
 * Handlers may throw a {@link ToolError} for a controlled error reply with a
 * custom message; anything else gets wrapped as a generic "Internal error."
 * without leaking exception details to the caller.
 */
export async function runTool<T>(opts: {
  toolName: string;
  extra: ToolExtra;
  /** Redacted snapshot of input args for the audit log. Pass `null` for none. */
  argsForAudit: Record<string, unknown> | null;
  handler: (ctx: ToolCtx) => Promise<T>;
}): Promise<CallToolResult> {
  const started = Date.now();
  const userId = getUserIdFromAuth(opts.extra.authInfo);
  const clientId = opts.extra.authInfo?.clientId ?? "unknown";

  // A verified token ALWAYS carries the authorizing user's id. Its absence means
  // the token is malformed / pre-migration — refuse rather than run a tool with
  // no owner to scope against. Audit the rejection (principal unknown).
  if (!userId) {
    await appendMcpAuditLog({
      principalId: null,
      clientId,
      tool: opts.toolName,
      argsJson: opts.argsForAudit,
      outcome: "error",
      errorMessage: "Unauthenticated: token carries no user id.",
      durationMs: Date.now() - started,
    });
    return errorContent("Not authenticated.");
  }

  // The audit principal IS the authorizing user.
  const principalId = userId;

  try {
    const result = await opts.handler({ userId, clientId });
    await appendMcpAuditLog({
      principalId,
      clientId,
      tool: opts.toolName,
      argsJson: opts.argsForAudit,
      outcome: "success",
      durationMs: Date.now() - started,
    });
    return textContent(result);
  } catch (err) {
    const isControlled = err instanceof ToolError;
    const message = isControlled
      ? (err as ToolError).message
      : "Internal error.";
    await appendMcpAuditLog({
      principalId,
      clientId,
      tool: opts.toolName,
      argsJson: opts.argsForAudit,
      outcome: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - started,
    });
    return errorContent(message);
  }
}

/**
 * Throw to send a specific error message back to the caller (e.g. "not
 * found", "cannot delete a mission with tasks"). Any other exception type is
 * masked to "Internal error" to avoid leaking implementation detail.
 */
export class ToolError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ToolError";
  }
}

/** Shortcut for permission failures. */
export function deny(message = "Not permitted."): never {
  throw new ToolError(message);
}

/** Shortcut for "row not found" / "doesn't exist". */
export function notFound(message = "Not found."): never {
  throw new ToolError(message);
}

// ---------------------------------------------------------------------------
// CallToolResult shape helpers
// ---------------------------------------------------------------------------

export function textContent(payload: unknown): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(payload, null, 2) }],
  };
}

export function errorContent(message: string): CallToolResult {
  return {
    content: [{ type: "text", text: message }],
    isError: true,
  };
}

// ---------------------------------------------------------------------------
// List-result conventions
// ---------------------------------------------------------------------------

export const MAX_LIST_ROWS = 5000;
export const MAX_DATE_RANGE_DAYS = 365;

/** Truncates an array to MAX_LIST_ROWS and tags the result. */
export function truncateList<T>(rows: T[]): {
  rows: T[];
  truncated: boolean;
  total: number;
} {
  if (rows.length > MAX_LIST_ROWS) {
    return {
      rows: rows.slice(0, MAX_LIST_ROWS),
      truncated: true,
      total: rows.length,
    };
  }
  return { rows, truncated: false, total: rows.length };
}
