import "server-only";

import { redirect } from "next/navigation";
import { createHttpDb } from "@opsboard/db";
import { getUserSetupCompletedAt } from "@opsboard/db/api-keys";
import { auth } from "@/lib/neon-auth";
import { ensureUserSynced } from "@/lib/auth-middleware";

// RSC / Server-Action session helper — the read-side counterpart to `withAuth`
// (lib/auth-middleware.ts), which only covers API route handlers. RSC pages and
// server actions can't be wrapped by `withAuth`, so they call this instead to
// resolve the verified Neon Auth principal.
//
// SECURITY: the userId is ALWAYS derived from the server-verified Neon Auth
// session (auth.getSession) — never from a query param, body, or any client
// input. The session shape mirrors AuthContext ({ userId, email }).

/** The resolved, server-verified principal for an RSC page / server action. */
export interface SessionUser {
  /** Neon Auth user id — the verified principal. NEVER from client input. */
  userId: string;
  /** Verified primary email (lowercased). May be null if the IdP omits it. */
  email: string | null;
}

/**
 * Resolve the verified Neon Auth principal for a Server Component or Server
 * Action. On no session it `redirect("/auth")`s (which throws, so callers never
 * proceed unauthenticated). Otherwise it lazily mirrors the user into
 * `public.users` (so a user-scoped insert downstream finds its parent row) and
 * returns `{ userId, email }`.
 */
export async function getSessionUser(): Promise<SessionUser> {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    redirect("/auth");
  }

  const userId = session.user.id;
  const email = session.user.email?.toLowerCase() ?? null;

  await ensureUserSynced(userId, email);

  return { userId, email };
}

/**
 * The SETUP-GATED counterpart to getSessionUser, for board pages / server
 * actions that require a fully-onboarded user (one who finished the BYO-keys
 * setup wizard). The gate lives HERE, at the RSC layer — NOT in the edge proxy,
 * which deliberately does no DB read (see apps/web/proxy.ts).
 *
 * Flow:
 *   1. Resolve the verified session via getSessionUser (which redirect("/auth")s
 *      when unauthenticated — so this never proceeds unauthed).
 *   2. Read `users.setup_completed_at`. If NULL → redirect("/setup").
 *   3. Otherwise return the verified principal.
 *
 * IMPORTANT: the /setup and /auth pages call getSessionUser (NOT this helper) so
 * they are reachable WITHOUT the onboarding check — otherwise an un-onboarded
 * user would be redirected /setup → /setup forever. Only flips via
 * markUserSetupComplete (driven by /api/setup/complete, which requires BOTH
 * keys stored), so the gate can't be bypassed without keys.
 */
export async function requireOnboardedUser(): Promise<SessionUser> {
  const { userId, email } = await getSessionUser();

  const completedAt = await getUserSetupCompletedAt(userId, createHttpDb());
  if (completedAt === null) {
    redirect("/setup");
  }

  return { userId, email };
}
