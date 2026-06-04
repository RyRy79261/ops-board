import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/mcp/origin";

// LIFTED from camp-404 (scaffolding-plan.md S6). RFC 8414 — OAuth
// Authorization Server Metadata. Claude.ai discovers our endpoints here.
// The issuer MUST come from the request / MCP_PUBLIC_URL (getPublicOrigin),
// NEVER VERCEL_URL, or it points at the SSO-gated deployment URL and Claude
// gets a 403 (research-dossier §9). Served at /.well-known/... via the
// next.config rewrite.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: Request) {
  const origin = getPublicOrigin(req);
  return NextResponse.json(
    {
      issuer: origin,
      authorization_endpoint: `${origin}/api/mcp/oauth/authorize`,
      token_endpoint: `${origin}/api/mcp/oauth/token`,
      registration_endpoint: `${origin}/api/mcp/oauth/register`,
      scopes_supported: ["mcp:owner"],
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: [
        "none",
        "client_secret_basic",
        "client_secret_post",
      ],
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
