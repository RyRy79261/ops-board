import "server-only";

import { redirect } from "next/navigation";
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
