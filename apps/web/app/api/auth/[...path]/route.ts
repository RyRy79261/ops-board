import { auth } from "@/lib/neon-auth";

// Catch-all that proxies Better Auth's API surface: sign-in, sign-up,
// get-session, sign-out, OAuth callbacks, etc. The verb handlers come straight
// off the shared Neon Auth instance — re-export them so Next routes
// /api/auth/* through Better Auth.
export const { GET, POST } = auth.handler();
