import "server-only";

import { NextResponse } from "next/server";
import type { z } from "zod";
import { appendMcpAuditLog } from "@opsboard/db/mcp";
import { rateLimiter } from "@/lib/rate-limit";
import {
  resolveApiPrincipal,
  type ApiPrincipal,
} from "@/lib/api-principal";

// The /api/v1 REST surface's runTool analogue. Every v1 route handler runs
// through `runV1`, which provides the same cross-cutting guarantees the MCP
// layer gets from runTool:
//   1. AUTH — resolveApiPrincipal (session cookie OR opsb_ API key) → 401.
//   2. RATE LIMITS — a generic per-principal v1 bucket, plus an optional
//      named bucket that SHARES keys with the equivalent MCP/HTTP flows
//      (e.g. research-cue:{userId}), so all transports draw one budget.
//   3. AUDIT — one row per call in mcp_audit_log (the app's single audit
//      stream); clientId records the transport + key identity.
//   4. ERROR MASKING — deliberate failures throw V1Error (status + client-safe
//      message); anything else becomes a generic 500, no SQL/stack leakage.
//
// Handlers throw V1Error for caller-visible failures; notFoundV1 is the 404
// shortcut. Owner-scoping is the handler's job via `principal.userId` — a
// foreign id must read as not-found, exactly like the MCP tools.

/** Generic per-principal request budget for the v1 surface (per minute). */
const V1_LIMIT_PER_MINUTE = 120;

/** Deliberate, caller-visible failure: HTTP status + client-safe message. */
export class V1Error extends Error {
  constructor(
    public readonly status: number,
    message: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "V1Error";
  }
}

/** Shortcut for "row not found / not yours" — both read identically. */
export function notFoundV1(message = "Not found."): never {
  throw new V1Error(404, message);
}

/**
 * Parse + validate a JSON body BEFORE entering runV1 (so the validated value
 * can feed argsForAudit). Never throws — a malformed body yields a ready 400
 * response the route returns directly.
 */
export async function safeParseBody<S extends z.ZodType>(
  req: Request,
  schema: S,
): Promise<{ ok: true; data: z.infer<S> } | { ok: false; response: Response }> {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return {
      ok: false,
      response: NextResponse.json({ error: "Invalid JSON body." }, { status: 400 }),
    };
  }
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      response: NextResponse.json(
        {
          error: issue
            ? `${issue.path.join(".") || "body"}: ${issue.message}`
            : "Invalid body.",
        },
        { status: 400 },
      ),
    };
  }
  return { ok: true, data: parsed.data };
}

/**
 * Surface a service-layer `{ ok:false, error }` as a caller-visible failure.
 * The db services phrase ownership/scope failures as "… not found" — map those
 * to 404 so a foreign id is indistinguishable from an absent one; everything
 * else is a 400 domain rejection.
 */
export function unwrapV1<T extends { ok: boolean }>(
  result: T,
): Extract<T, { ok: true }> {
  if (!result.ok) {
    const error =
      (result as { error?: string }).error ?? "Operation failed.";
    throw new V1Error(/not found/i.test(error) ? 404 : 400, error);
  }
  return result as Extract<T, { ok: true }>;
}

export interface RunV1Options<T> {
  req: Request;
  /** Audit name, e.g. "v1.cue_research" — mirrors the MCP tool vocabulary. */
  op: string;
  /** Redacted snapshot for the audit row (never secrets). Null for none. */
  argsForAudit?: Record<string, unknown> | null;
  /**
   * Optional named bucket SHARED with the equivalent MCP/HTTP flow — pass the
   * same base name they use (e.g. { name: "research-cue", max: 20 }).
   */
  limit?: { name: string; max: number };
  /** 2xx status for a successful result (default 200). */
  successStatus?: number;
  handler: (principal: ApiPrincipal) => Promise<T>;
}

export async function runV1<T>(opts: RunV1Options<T>): Promise<Response> {
  const started = Date.now();

  const principal = await resolveApiPrincipal(opts.req);
  if (!principal) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const generic = await rateLimiter.limit(`v1:${principal.userId}`, {
    limit: V1_LIMIT_PER_MINUTE,
  });
  if (!generic.ok) return rateLimited(generic.retryAfterSeconds);
  if (opts.limit) {
    const named = await rateLimiter.limit(
      `${opts.limit.name}:${principal.userId}`,
      { limit: opts.limit.max },
    );
    if (!named.ok) return rateLimited(named.retryAfterSeconds);
  }

  // The audit stream's client identity: which transport, and which key.
  const clientId =
    principal.via === "api-key"
      ? `v1-key:${principal.keyId}`
      : "v1-session";

  try {
    const result = await opts.handler(principal);
    await appendMcpAuditLog({
      principalId: principal.userId,
      clientId,
      tool: opts.op,
      argsJson: opts.argsForAudit ?? null,
      outcome: "success",
      durationMs: Date.now() - started,
    });
    return NextResponse.json(result ?? { ok: true }, {
      status: opts.successStatus ?? 200,
    });
  } catch (err) {
    const controlled = err instanceof V1Error;
    const status = controlled ? (err as V1Error).status : 500;
    const message = controlled ? (err as V1Error).message : "Internal error.";
    const code = controlled ? (err as V1Error).code : undefined;
    await appendMcpAuditLog({
      principalId: principal.userId,
      clientId,
      tool: opts.op,
      argsJson: opts.argsForAudit ?? null,
      outcome: "error",
      errorMessage: err instanceof Error ? err.message : String(err),
      durationMs: Date.now() - started,
    });
    if (!controlled) console.error(`v1 ${opts.op} failed`, err);
    return NextResponse.json(
      code ? { error: message, code } : { error: message },
      { status },
    );
  }
}

function rateLimited(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
