import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/neon-auth";
import { e2eSessionUserFromCookie } from "@/lib/session-e2e";

/**
 * PAGE GATING + the Neon Auth OAuth verifier exchange.
 *
 * (Next.js 16 also renamed this file convention `middleware.ts` → `proxy.ts`,
 * which is why this lives in proxy.ts; on 16.2 the old name still ran with a
 * deprecation warning, so the rename alone was NOT what fixed Google sign-in.)
 *
 * `auth.middleware()` does two jobs in one pass:
 *   1. Exchanges the `?neon_auth_session_verifier=…` that Neon Auth's hosted
 *      social callback appends to the return URL for a real session cookie on
 *      our origin. This runs nowhere else (NOT in auth.handler()), so it has
 *      to be in the proxy or social sign-in silently never gets a session.
 *   2. Redirects unauthenticated requests to `loginUrl` (/auth/sign-in) — the
 *      page gate.
 *
 * CRITICAL — why loginUrl is "/auth/sign-in" and NOT "/auth":
 *   Inside Neon Auth's middleware processor the FIRST thing it does is
 *   `if (pathname.startsWith(loginUrl)) return { action: "allow" }` — BEFORE
 *   the verifier-exchange check. Our Google `callbackURL` lands the user back
 *   on `/auth?neon_auth_session_verifier=…`. If loginUrl were "/auth", that
 *   `/auth` landing would match the short-circuit and the verifier exchange
 *   would be SKIPPED — no session cookie ever set, so /auth bounces the user
 *   straight back to /auth/sign-in ("nothing happens" after Google). Using
 *   "/auth/sign-in" means the `/auth` callback does NOT match the short-circuit,
 *   the exchange runs, and the session lands. (This is exactly how camp-404 —
 *   our working reference — has it.)
 *
 * ALLOW-LIST (never gated):
 *   - /auth and /auth/*  — the sign-in surface itself + the OAuth landing.
 *     We STILL run auth.middleware here so the verifier exchange fires on the
 *     /auth callback. /auth/sign-in matches loginUrl so it never loops; the
 *     bare /auth (no session, no verifier) is redirected to /auth/sign-in,
 *     same as /auth/page.tsx would do.
 *   - /api/*  — API routes do their own auth via withAuth() and answer with a
 *     JSON 401 { requiresAuth: true }, not a page redirect. (This includes
 *     /api/auth/*, the Better Auth handler, which must stay open.)
 *   - _next, static assets, favicon — handled by the matcher below.
 *
 * Open signup: there is NO email whitelist anywhere in this flow.
 *
 * NOTE (runtime): `proxy` runs on the Node.js runtime (the `edge` runtime is
 * not supported for proxy in Next 16). The Neon Auth cookie/session work runs
 * fine there — camp-404 proves it.
 *
 * SETUP-GATE (per-user BYO Anthropic+Groq keys): the "setup complete" gate is
 * DELIBERATELY NOT here. It lives at the RSC layer — `requireOnboardedUser()`
 * in apps/web/lib/session.ts, which board pages / server actions call. It reads
 * `users.setup_completed_at` and redirect("/setup")s an onboarded-but-unconfigured
 * user. We do NOT add a DB read to this edge proxy: it runs on every navigation
 * and a per-request DB round-trip in the proxy would tax every page load (and
 * the proxy has no cheap, verified handle on the user row). The /setup and
 * /auth pages use getSessionUser (WITHOUT the onboarding check) so there's no
 * redirect loop; only /api/setup/complete (both keys required) flips the gate.
 */
const protect = auth.middleware({ loginUrl: "/auth/sign-in" });

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  // E2E TEST-AUTH SEAM — inert unless E2E_TEST_AUTH=1 in a NON-production build
  // (mirrors getSessionUser; see lib/session-e2e.ts). The remote Neon Auth proxy
  // is unavailable under e2e, so a valid `e2e-user` cookie IS the session: let
  // the request straight through (the RSC getSessionUser resolves the SAME
  // cookie). This branch cannot run in prod (flag never set + NODE_ENV guard).
  const e2eActive =
    process.env.NODE_ENV !== "production" &&
    process.env.E2E_TEST_AUTH === "1";
  if (
    e2eActive &&
    e2eSessionUserFromCookie(
      process.env,
      request.cookies.get("e2e-user")?.value,
    )
  ) {
    return NextResponse.next();
  }

  // API routes are never page-gated — they authenticate via withAuth() and
  // return JSON 401s. This also keeps the Better Auth handler (/api/auth/*)
  // and the public MCP endpoints reachable.
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // PUBLIC metadata routes. These are App-Router file conventions served at
  // EXTENSIONLESS paths, so the static-asset matcher below (which only excludes
  // *.svg/*.png/… and /favicon.ico) does NOT catch them — without this guard
  // they'd be auth-gated, which (a) makes the browser fetch /manifest.webmanifest
  // get a /auth HTML redirect → "Manifest: Syntax error", and (b) hides the OG /
  // Twitter card from social crawlers (which never carry a session). They expose
  // no user data, so they must be reachable while logged out.
  // (The .svg/.png icon routes — /icon.svg, /icon-192.png, … — already match the
  // static-asset exclusion in `config.matcher`, so the proxy never runs on
  // them; only these extensionless ones need an explicit pass-through.)
  if (
    pathname === "/manifest.webmanifest" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.startsWith("/opengraph-image") ||
    pathname.startsWith("/twitter-image") ||
    pathname.startsWith("/apple-icon")
  ) {
    return NextResponse.next();
  }

  // E2E (no valid cookie): the Neon Auth proxy is unavailable, so gate protected
  // pages straight to the sign-in surface and let /auth* through (no loop) —
  // mirroring the real gate without the remote dependency.
  if (e2eActive) {
    if (pathname.startsWith("/auth")) {
      return NextResponse.next();
    }
    const url = request.nextUrl.clone();
    url.pathname = "/auth/sign-in";
    return NextResponse.redirect(url);
  }

  // Everything else (the board pages + /auth itself) goes through the Neon
  // Auth proxy: verifier exchange on the /auth callback, plus the
  // unauth→/auth/sign-in redirect for protected pages. loginUrl is
  // "/auth/sign-in" (NOT "/auth") so the /auth OAuth landing is NOT
  // short-circuited before the verifier exchange — see the header comment.
  return protect(request);
}

export const config = {
  // Skip Next internals and static files so the proxy only ever runs on
  // real navigations. (The /api/* short-circuit above is belt-and-braces.)
  matcher: [
    "/((?!_next|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)$).*)",
  ],
};
