import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import {
  createClientApiKey,
  listClientApiKeys,
} from "@opsboard/db/client-api-keys";
import { generateOpaqueToken, sha256 } from "@/lib/mcp/tokens";
import { CLIENT_KEY_PREFIX } from "@/lib/client-key";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";

// Programmatic API-key management (the /api/v1 surface's credentials —
// client_api_keys, NOT the BYO AI-provider keys at ./api-keys). DELIBERATELY
// session-only: keys are minted and revoked from the Settings UI, never over
// /api/v1 or MCP, so a leaked credential can never mint more credentials.
//
// POST returns the plaintext key EXACTLY ONCE — only its SHA-256 + a display
// prefix are stored. GET returns metadata only (name, prefix, timestamps).

export const runtime = "nodejs"; // node:crypto for token generation + hashing.

const CreateSchema = z.object({
  name: z.string().trim().min(1).max(120),
});

export const GET = withAuth(async (_req, { userId }) => {
  const keys = await listClientApiKeys(userId);
  return NextResponse.json({
    keys: keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      createdAt: k.createdAt.toISOString(),
      lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
      revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
    })),
  });
});

export const POST = withAuth(async (req, { userId }) => {
  const limited = await rateLimiter.limit(
    `access-key-create:${getClientIp(req.headers)}`,
    { limit: 10 },
  );
  if (!limited.ok) {
    return NextResponse.json(
      { error: "Rate limit exceeded" },
      {
        status: 429,
        headers: { "Retry-After": String(limited.retryAfterSeconds) },
      },
    );
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = CreateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Expected { name }." },
      { status: 400 },
    );
  }

  // Mint the secret HERE; store only its hash + a display prefix.
  const plaintext = `${CLIENT_KEY_PREFIX}${generateOpaqueToken(32)}`;
  const res = await createClientApiKey(
    {
      name: parsed.data.name,
      keyHash: sha256(plaintext),
      prefix: `${plaintext.slice(0, CLIENT_KEY_PREFIX.length + 6)}…`,
    },
    userId,
  );
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 400 });
  }

  return NextResponse.json(
    {
      key: {
        id: res.key.id,
        name: res.key.name,
        prefix: res.key.prefix,
        createdAt: res.key.createdAt.toISOString(),
        lastUsedAt: null,
        revokedAt: null,
      },
      // Shown once, never retrievable again.
      plaintext,
    },
    { status: 201 },
  );
});
