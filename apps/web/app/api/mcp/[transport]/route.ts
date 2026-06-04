import { createMcpHandler, withMcpAuth } from "mcp-handler";
import { NextResponse } from "next/server";
import { verifyMcpToken } from "@/lib/mcp/auth";
import { registerOpsboardTools } from "@/lib/mcp/server";

// LIFTED from camp-404 apps/web/app/api/mcp/[transport]/route.ts
// (scaffolding-plan.md S6); only the server name + tool registrar are swapped.
//
// IMPORTANT: with basePath "/api/mcp" + this file at
// /api/mcp/[transport]/route.ts, the connector URL Claude.ai uses is
// /api/mcp/mcp (the transport segment value = "mcp"). Looks wrong, is correct.
const baseHandler = createMcpHandler(
  (server) => registerOpsboardTools(server),
  { serverInfo: { name: "opsboard", version: "0.1.0" } },
  { basePath: "/api/mcp", disableSse: true },
);

const authedHandler = withMcpAuth(baseHandler, verifyMcpToken, {
  required: true,
  resourceMetadataPath: "/.well-known/oauth-protected-resource",
});

// CORS is required because Claude.ai is a different origin. The
// WWW-Authenticate header needs to be readable cross-origin so the client can
// follow the resource_metadata hint after a 401.
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers":
    "Content-Type, Authorization, mcp-protocol-version, mcp-session-id",
  "Access-Control-Expose-Headers": "WWW-Authenticate",
};

async function handle(req: Request): Promise<Response> {
  const res = await authedHandler(req);
  const headers = new Headers(res.headers);
  for (const [k, v] of Object.entries(CORS_HEADERS)) headers.set(k, v);
  return new Response(res.body, {
    status: res.status,
    statusText: res.statusText,
    headers,
  });
}

export const GET = handle;
export const POST = handle;
export const DELETE = handle; // MCP session termination

export function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}
