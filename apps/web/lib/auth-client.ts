"use client";

import { createAuthClient } from "@neondatabase/auth/next";

/**
 * Neon Auth (Better Auth) client instance. Same-origin fetches to
 * /api/auth/* — no base URL needed.
 *
 * Use from client components:
 *   import { authClient } from "@/lib/auth-client";
 *   const { data: session } = authClient.useSession();
 *   await authClient.signIn.email({ email, password });
 *   await authClient.signUp.email({ email, password, name });
 *   await authClient.signOut();
 */
export const authClient = createAuthClient();

// Named re-exports so call-sites can `import { useSession, signIn } from
// "@/lib/auth-client"` without reaching through the client object.
export const { useSession, signIn, signUp, signOut } = authClient;
