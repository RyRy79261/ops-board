import { NextResponse } from "next/server";
import { z } from "zod";
import { DEFAULT_SCOPE, findClient, isAllowedScope, issueAuthCode } from "@/lib/mcp/oauth";
import { auth } from "@/lib/neon-auth";
import { ensureUserSynced } from "@/lib/auth-middleware";

// ADAPTED from camp-404 apps/web/app/api/mcp/oauth/authorize/route.ts
// (scaffolding-plan.md S6). MCP is per-user: consent is GATED behind a verified
// Neon Auth session. The GET handler redirects an unauthenticated visitor to
// /auth with a callbackURL back to this full authorize URL (so after sign-in
// they return to approve). On POST "approve" we capture the verified
// session.user.id and bind the minted code to it (issueAuthCode stores it in
// user_id + principal_id); with no session on POST we deny.
//
// PRESERVED EXACTLY (the OAuth-shell load-bearing bits):
//   - PKCE: code_challenge / code_challenge_method flow unchanged.
//   - Redirect / scope / client validation via resolveClientOrError.
//   - The meta-refresh `htmlRedirect` — NEVER a 302. CSP `form-action 'self'`
//     silently drops cross-origin 302s from POST handlers (research-dossier
//     §9). The redirect back to claude.ai MUST go through this doc-level nav.
//
// RESKIN: orange / near-black OpsBoard tokens (design-brief §3), sharp corners
// (--radius:0), JetBrains Mono chrome + DM Sans human text, "Connect Claude to
// your OpsBoard" copy.

// ---------------------------------------------------------------------------
// Shared validation
// ---------------------------------------------------------------------------

const AuthorizeQuery = z.object({
  response_type: z.literal("code"),
  client_id: z.string().min(1),
  redirect_uri: z.string().url(),
  code_challenge: z.string().min(1),
  code_challenge_method: z.enum(["S256"]).default("S256"),
  scope: z.string().optional(),
  state: z.string().optional(),
});

type AuthorizeParams = z.infer<typeof AuthorizeQuery>;

function parseParams(searchParams: URLSearchParams) {
  return AuthorizeQuery.safeParse(Object.fromEntries(searchParams.entries()));
}

async function resolveClientOrError(params: AuthorizeParams) {
  const client = await findClient(params.client_id);
  if (!client) {
    return errorPage(400, "unknown_client", "Unknown client_id.");
  }
  if (!client.redirectUris.includes(params.redirect_uri)) {
    return errorPage(
      400,
      "invalid_redirect_uri",
      "redirect_uri does not match any URI registered for this client.",
    );
  }
  const scope = params.scope ?? DEFAULT_SCOPE;
  if (!isAllowedScope(scope)) {
    return redirectError(params.redirect_uri, "invalid_scope", params.state);
  }
  return { client, scope };
}

// ---------------------------------------------------------------------------
// GET — render consent screen
// ---------------------------------------------------------------------------

export async function GET(req: Request) {
  const url = new URL(req.url);
  const parsed = parseParams(url.searchParams);
  if (!parsed.success) {
    return errorPage(
      400,
      "invalid_request",
      parsed.error.issues[0]?.message ?? "Invalid authorize request.",
    );
  }

  const resolved = await resolveClientOrError(parsed.data);
  if (resolved instanceof NextResponse) return resolved;

  // GATE consent behind a verified Neon Auth session. With no session, send the
  // visitor to sign in and bring them straight back to THIS authorize URL
  // (full original query intact) so they can approve once authenticated.
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    const callbackURL = url.pathname + url.search;
    const signIn = new URL("/auth", url.origin);
    signIn.searchParams.set("callbackURL", callbackURL);
    return NextResponse.redirect(signIn);
  }

  return consentHtml({
    clientName: resolved.client.clientName,
    scope: resolved.scope,
    params: parsed.data,
  });
}

// ---------------------------------------------------------------------------
// POST — approve / deny
// ---------------------------------------------------------------------------

const AuthorizeAction = z.enum(["approve", "deny"]);

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return errorPage(400, "invalid_request", "Form body required.");
  }

  // Require an explicit approve/deny — a missing or unexpected `action` must
  // NOT fall through to minting an auth code (unconfirmed consent grants nothing).
  const actionParsed = AuthorizeAction.safeParse(form.get("action"));
  if (!actionParsed.success) {
    return errorPage(400, "invalid_request", "Invalid action.");
  }
  const action = actionParsed.data;
  const rebuilt = new URLSearchParams();
  for (const [k, v] of form.entries()) {
    if (k === "action") continue;
    if (typeof v === "string") rebuilt.append(k, v);
  }
  const parsed = parseParams(rebuilt);
  if (!parsed.success) {
    return errorPage(
      400,
      "invalid_request",
      parsed.error.issues[0]?.message ?? "Invalid authorize submission.",
    );
  }

  const resolved = await resolveClientOrError(parsed.data);
  if (resolved instanceof NextResponse) return resolved;

  if (action === "deny") {
    return htmlRedirect(
      buildRedirectUrl(parsed.data.redirect_uri, {
        error: "access_denied",
        ...(parsed.data.state ? { state: parsed.data.state } : {}),
      }),
    );
  }

  // A confirmed Approve must be tied to a verified Neon Auth session — the code
  // is bound to the approving human's user id. No session ⇒ DENY (an
  // unauthenticated POST grants nothing). userId is NEVER taken from the form.
  const { data: session } = await auth.getSession();
  if (!session?.user?.id) {
    return errorPage(
      401,
      "login_required",
      "You must be signed in to approve this connection. Start the connection again to sign in first.",
    );
  }
  const userId = session.user.id;
  await ensureUserSynced(userId, session.user.email?.toLowerCase() ?? null);

  const code = await issueAuthCode({
    clientId: parsed.data.client_id,
    userId,
    redirectUri: parsed.data.redirect_uri,
    codeChallenge: parsed.data.code_challenge,
    codeChallengeMethod: parsed.data.code_challenge_method,
    scope: resolved.scope,
  });

  return htmlRedirect(
    buildRedirectUrl(parsed.data.redirect_uri, {
      code,
      ...(parsed.data.state ? { state: parsed.data.state } : {}),
    }),
  );
}

// ---------------------------------------------------------------------------
// HTML helpers. This route emits raw HTML outside the Next/React/Tailwind
// shell, so the OpsBoard brand tokens (design-brief §3) are resolved inline as
// an OKLCH :root block (kept in sync with packages/ui globals.css) and the
// lucide glyphs are inlined as SVG. Sharp corners (--radius:0), JetBrains Mono
// for chrome/data, DM Sans for human text.
// ---------------------------------------------------------------------------

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Inlined lucide paths: terminal (OpsBoard mark), shield, list-checks.
const ICON = {
  terminal: `<polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/>`,
  shield: `<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>`,
} as const;

function svgIcon(inner: string): string {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${inner}</svg>`;
}

// Human-facing copy for the (currently single) MCP scope.
const SCOPE_COPY: Record<string, string> = {
  "mcp:owner": "Read and update your missions, tasks, and dependencies",
};

const THEME_STYLE = `
  :root {
    --background: oklch(0.146 0.004 286);
    --foreground: oklch(0.933 0.011 286);
    --muted: oklch(0.189 0.010 285);
    --muted-foreground: oklch(0.586 0.030 285);
    --muted-foreground-subtle: oklch(0.417 0.033 285);
    --card: oklch(0.221 0.016 285);
    --card-elevated: oklch(0.257 0.022 285);
    --border: oklch(0.291 0.025 285);
    --primary: oklch(0.705 0.193 39);
    --primary-foreground: oklch(0.146 0.004 286);
    --radius: 0px;
    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
    --font-sans: "DM Sans", ui-sans-serif, system-ui, -apple-system, sans-serif;
  }
  * { box-sizing: border-box; }
  body {
    margin: 0; min-height: 100dvh; padding: 1.5rem;
    display: flex; align-items: center; justify-content: center;
    background: var(--background); color: var(--foreground);
    font: 14px/1.5 var(--font-sans);
  }
  .shell { width: 100%; max-width: 28rem; display: flex; flex-direction: column; gap: 1.25rem; }
  .brand {
    display: flex; align-items: center; gap: 0.625rem;
    font-family: var(--font-mono); font-size: 0.75rem; font-weight: 700;
    letter-spacing: 0.25em; text-transform: uppercase;
  }
  .brand svg { width: 1.125rem; height: 1.125rem; color: var(--primary); }
  .brand .ops { color: var(--primary); }
  .brand .board { color: var(--muted-foreground); }
  h1.title { font-size: 1.5rem; font-weight: 700; margin: 0; }
  .lede { margin: 0; color: var(--muted-foreground); font-size: 0.9375rem; }
  .card {
    background: var(--card); border: 1px solid var(--border); border-radius: var(--radius);
    padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem;
  }
  .req-row { display: flex; justify-content: space-between; align-items: center; gap: 0.5rem; }
  .req-row .label {
    font-family: var(--font-mono); font-size: 0.6875rem; letter-spacing: 0.125em;
    text-transform: uppercase; color: var(--muted-foreground-subtle);
  }
  .req-row .value {
    font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 600; color: var(--foreground);
  }
  .scope-row {
    display: flex; gap: 0.75rem; align-items: center; padding: 0.75rem;
    border-radius: var(--radius); background: var(--card-elevated);
    border-left: 2px solid var(--primary);
  }
  .scope-icon {
    width: 2.125rem; height: 2.125rem; flex: none; border-radius: var(--radius);
    display: flex; align-items: center; justify-content: center;
    background: oklch(0.705 0.193 39 / 0.12); color: var(--primary);
  }
  .scope-icon svg { width: 1.125rem; height: 1.125rem; }
  .scope-text { display: flex; flex-direction: column; gap: 0.125rem; min-width: 0; }
  .scope-name {
    font-family: var(--font-mono); font-size: 0.8125rem; font-weight: 600; color: var(--foreground);
  }
  .scope-desc { font-size: 0.8125rem; color: var(--muted-foreground); }
  form { margin: 0; }
  .btn-row { display: flex; gap: 0.75rem; }
  .btn {
    flex: 1; padding: 0.8125rem 1rem; border-radius: var(--radius);
    font-size: 0.9375rem; font-weight: 600; cursor: pointer; border: 1px solid;
    font-family: inherit;
  }
  .btn-primary { background: var(--primary); color: var(--primary-foreground); border-color: var(--primary); }
  .btn-outline { background: transparent; color: var(--foreground); border-color: var(--border); }
  .err-title { font-size: 1.25rem; font-weight: 700; margin: 0 0 0.25rem; }
  .err-desc { margin: 0; color: var(--muted-foreground); }
`;

function htmlDoc(title: string, inner: string): string {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <style>${THEME_STYLE}</style>
</head>
<body><div class="shell">${inner}</div></body>
</html>`;
}

function htmlResponse(status: number, html: string): NextResponse {
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function brandMark(): string {
  return `<div class="brand">${svgIcon(ICON.terminal)}<span><span class="ops">OPS</span><span class="board">BOARD</span></span></div>`;
}

function consentHtml(opts: {
  clientName: string;
  scope: string;
  params: AuthorizeParams;
}): NextResponse {
  const hiddenInputs = Object.entries(opts.params)
    .map(
      ([k, v]) =>
        `<input type="hidden" name="${escapeHtml(k)}" value="${escapeHtml(String(v))}">`,
    )
    .join("\n      ");

  const scopeDesc = SCOPE_COPY[opts.scope] ?? "Access your OpsBoard data";

  const inner = `
    ${brandMark()}
    <div>
      <h1 class="title">Connect Claude to your OpsBoard</h1>
      <p class="lede">Approve to let Claude read and run mission commands on your board — the same create, read, update, and delete actions you have by voice.</p>
    </div>
    <div class="card">
      <div class="req-row">
        <span class="label">Requesting access</span>
        <span class="value">${escapeHtml(opts.clientName)}</span>
      </div>
      <div class="scope-row">
        <span class="scope-icon">${svgIcon(ICON.shield)}</span>
        <span class="scope-text">
          <span class="scope-name">${escapeHtml(opts.scope)}</span>
          <span class="scope-desc">${escapeHtml(scopeDesc)}</span>
        </span>
      </div>
      <form method="POST" action="/api/mcp/oauth/authorize">
      ${hiddenInputs}
        <div class="btn-row">
          <button type="submit" name="action" value="deny" class="btn btn-outline">Deny</button>
          <button type="submit" name="action" value="approve" class="btn btn-primary">Approve</button>
        </div>
      </form>
    </div>`;

  return htmlResponse(
    200,
    htmlDoc(`Connect ${opts.clientName} — OpsBoard`, inner),
  );
}

/**
 * Document-level navigation via meta refresh + JS — required INSTEAD of a 302
 * because CSP `form-action 'self'` silently drops cross-origin redirects from
 * POST handlers (research-dossier §9). DO NOT replace with NextResponse.redirect.
 */
function htmlRedirect(target: string): NextResponse {
  const e = escapeHtml(target);
  const body = `<!doctype html><html><head>
  <meta charset="utf-8">
  <meta http-equiv="refresh" content="0;url=${e}">
</head><body>
  <p>Redirecting… <a href="${e}">Continue</a> if not redirected.</p>
  <script>window.location.replace(${JSON.stringify(target)});</script>
</body></html>`;
  return new NextResponse(body, {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function buildRedirectUrl(
  base: string,
  params: Record<string, string>,
): string {
  const url = new URL(base);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return url.toString();
}

function redirectError(
  redirectUri: string,
  error: string,
  state: string | undefined,
) {
  return htmlRedirect(
    buildRedirectUrl(redirectUri, {
      error,
      ...(state ? { state } : {}),
    }),
  );
}

function errorPage(
  status: number,
  error: string,
  description: string,
): NextResponse {
  const pretty = error.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());
  const inner = `
    ${brandMark()}
    <div class="card">
      <h1 class="err-title">${escapeHtml(pretty)}</h1>
      <p class="err-desc">${escapeHtml(description)}</p>
    </div>`;
  return htmlResponse(status, htmlDoc(`${pretty} — OpsBoard`, inner));
}
