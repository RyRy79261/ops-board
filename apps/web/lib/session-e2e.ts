import { z } from "zod";
import type { SessionUser } from "./session";

// The `e2e-user` cookie is client-controlled external input, so its decoded
// payload is validated at this boundary with Zod (per the repo guideline).
const E2eCookiePayload = z.object({
  userId: z.string().min(1),
  email: z.preprocess(
    (value) => (typeof value === "string" ? value : null),
    z.string().nullable(),
  ),
});

// E2E TEST-AUTH SEAM — the pure core of the test-only session bypass used by
// getSessionUser (lib/session.ts).
//
// SECURITY: this is INERT unless BOTH conditions hold:
//   1. the build is NOT production (process.env.NODE_ENV !== "production"), and
//   2. the explicit E2E_TEST_AUTH=1 flag is set.
// The e2e CI job and the local `pnpm e2e` run set the flag against a throwaway
// database; it is NEVER set in prod/preview, so the bypass cannot resolve a
// principal there. Next inlines NODE_ENV, so in a production build the call
// site's `!== "production"` guard is statically false and the whole branch is
// dropped — defence in depth on top of the flag.
//
// Kept as a pure function (no `server-only`, no next/headers, no DB) so every
// inert/active path is exhaustively unit-testable without a server context.

/**
 * Resolve a {@link SessionUser} from the raw `e2e-user` cookie value, or null
 * when the seam is inert or the cookie is absent/malformed. The cookie carries
 * base64-encoded JSON `{ userId, email }` — base64 so the JSON's braces/quotes/
 * commas survive intact as a cookie value.
 */
export function e2eSessionUserFromCookie(
  env: { NODE_ENV?: string; E2E_TEST_AUTH?: string },
  cookieValue: string | undefined,
): SessionUser | null {
  if (env.NODE_ENV === "production") return null;
  if (env.E2E_TEST_AUTH !== "1") return null;
  if (!cookieValue) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(Buffer.from(cookieValue, "base64").toString("utf8"));
  } catch {
    return null;
  }

  const result = E2eCookiePayload.safeParse(parsed);
  if (!result.success) return null;

  return {
    userId: result.data.userId,
    email: result.data.email?.toLowerCase() ?? null,
  };
}
