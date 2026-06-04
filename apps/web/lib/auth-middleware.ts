import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import { createHttpDb, schema } from "@opsboard/db";
import { auth } from "@/lib/neon-auth";

/**
 * Route-handler auth for OpsBoard. ADAPTED from intake-tracker
 * (src/lib/auth-middleware.ts) but stripped to OpsBoard's model:
 *   - OPEN signup: NO email whitelist (anyone who signs up may use the app).
 *     intake-tracker's ALLOWED_EMAILS / accountUnapproved 403 path is removed.
 *   - WEB-ONLY: cookie session only. intake-tracker's Capacitor Bearer-token
 *     path (extractBearerToken / validateBearerToken) is removed.
 *
 * SECURITY: the principal userId is ALWAYS derived from the verified Neon Auth
 * session — never from client input (no header, body, or query is trusted).
 */

/** The resolved, server-verified principal handed to a wrapped handler. */
export interface AuthContext {
  /** Neon Auth user id — the verified principal. NEVER from client input. */
  userId: string;
  /** Verified primary email (lowercased). May be null if the IdP omits it. */
  email: string | null;
}

/** A route handler that runs only after auth succeeds. */
export type AuthenticatedHandler = (
  request: NextRequest,
  ctx: AuthContext,
) => Promise<NextResponse> | NextResponse;

/**
 * Lazily mirror the authenticated user into `public.users`.
 *
 * Neon Auth (Better Auth) owns credentials/sessions; this upsert keeps
 * OpsBoard's own `users` row in sync so the NEXT PR's data tables can FK to
 * it. Run before the handler so any user-scoped insert downstream finds its
 * parent row. Failures are logged, not fatal: read routes don't need the row,
 * and a write route that does will surface the FK error on its own insert.
 */
export async function ensureUserSynced(
  userId: string,
  email: string | null,
): Promise<void> {
  try {
    const db = createHttpDb();
    const now = new Date();
    await db
      .insert(schema.users)
      .values({ id: userId, email: email ?? "", updatedAt: now })
      .onConflictDoUpdate({
        target: schema.users.id,
        // Only refresh mutable fields; never clobber created_at.
        set: { email: email ?? "", updatedAt: now },
      });
  } catch (e) {
    console.error("[auth] users upsert failed:", e);
  }
}

/**
 * Higher-order function that wraps an API route handler with cookie-session
 * auth. On no session it returns 401 + `{ requiresAuth: true }` (the client
 * should send the user to /auth). Otherwise it lazily upserts the user and
 * calls the handler with the verified `{ userId, email }`.
 *
 * Usage:
 * ```ts
 * export const POST = withAuth(async (request, { userId, email }) => {
 *   // userId is the verified Neon Auth principal — safe to scope writes by.
 *   return NextResponse.json({ ok: true });
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const { data: session } = await auth.getSession();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "No active session", requiresAuth: true },
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const email = session.user.email?.toLowerCase() ?? null;

    // Open signup — no whitelist. Mirror the user, then run the handler.
    await ensureUserSynced(userId, email);

    return handler(request, { userId, email });
  };
}
