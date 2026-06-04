import { NextResponse } from "next/server";
import { getPublicOrigin } from "@/lib/mcp/origin";

// LIFTED from camp-404 (scaffolding-plan.md S6). RFC 9728 — Protected Resource
// Metadata. Tells callers which auth server protects this resource (us) and
// what scopes it accepts. Origin via getPublicOrigin (MCP_PUBLIC_URL / request,
// never VERCEL_URL). Served at /.well-known/... via the next.config rewrite.

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function GET(req: Request) {
  const origin = getPublicOrigin(req);
  return NextResponse.json(
    {
      resource: `${origin}/api/mcp`,
      authorization_servers: [origin],
      scopes_supported: ["mcp:owner"],
      bearer_methods_supported: ["header"],
    },
    { headers: CORS_HEADERS },
  );
}

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
