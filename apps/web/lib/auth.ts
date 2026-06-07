import "server-only";

import { auth } from "@/lib/neon-auth";
import { ensureUserSynced } from "@/lib/auth-middleware";

// The voice routes' principal reader. Originally a single-user stub returning a
// constant "owner"; now reads the REAL verified Neon Auth session so the voice
// pipeline scopes every read/mutation to the signed-in user. The camp-404 route
// guard ladder (auth → rate-limit → validate → scrub) is preserved by the voice
// routes; this is the auth step. Rate-limiting is KEPT and keyed on the
// principal id + client IP.
//
// SECURITY: the principal id is ALWAYS the server-verified Neon Auth user id —
// never from client input. A missing session returns null (the route's
// `if (!user) 401` branch handles that).

/** The minimal principal shape the voice routes rate-limit + audit against. */
export interface Principal {
  id: string;
}

/**
 * The verified principal for the voice routes, read from the Neon Auth cookie
 * session. Returns null when there is no active session (the route answers 401).
 * Lazily mirrors the user into `public.users` so a user-scoped insert
 * downstream (createMission / createTask) finds its parent row.
 */
export async function getAuthenticatedUser(): Promise<Principal | null> {
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) return null;

  const userId = session.user.id;
  await ensureUserSynced(userId, session.user.email?.toLowerCase() ?? null);

  return { id: userId };
}
