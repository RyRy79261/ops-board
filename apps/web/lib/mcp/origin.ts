// LIFTED from camp-404 apps/web/lib/mcp/origin.ts (scaffolding-plan.md S6).
// Resolve the public-facing origin used as the OAuth issuer + endpoint base.
//
// CRITICAL GOTCHA (research-dossier §9): the issuer MUST come from
// `MCP_PUBLIC_URL` (or the request's forwarded host), NEVER from `VERCEL_URL`.
// `VERCEL_URL` is the deployment-hash domain (e.g. `<app>-abc123.vercel.app`)
// which on production deployments is gated by Vercel SSO and would 403
// Claude.ai's discovery fetches — pointing the issuer there breaks the connect
// flow. Resolution order:
//
//   1. `MCP_PUBLIC_URL` env override — set this on production / behind a proxy
//      or on a non-default custom domain. This is the canonical OpsBoard origin.
//   2. `x-forwarded-host` / `x-forwarded-proto` on the request — the user's
//      actual host as set by Vercel / the proxy. Wins over `VERCEL_URL`.
//   3. `host` header.
//   4. `VERCEL_URL` env — last resort, only when no request is in scope.
//   5. Local dev fallback.
export function getPublicOrigin(req?: Request): string {
  const override = process.env.MCP_PUBLIC_URL?.trim();
  if (override) return override.replace(/\/$/, "");

  if (req) {
    const fwdHost = req.headers.get("x-forwarded-host");
    const fwdProto = req.headers.get("x-forwarded-proto");
    if (fwdHost) return `${fwdProto ?? "https"}://${fwdHost}`;
    const host = req.headers.get("host");
    if (host) {
      const proto =
        fwdProto ?? (host.startsWith("localhost") ? "http" : "https");
      return `${proto}://${host}`;
    }
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
