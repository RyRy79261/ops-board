import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import {
  clearUserApiKey,
  getUserApiKeyRow,
  setUserApiKey,
} from "@opsboard/db/api-keys";
import { encryptKey, lastFourOf, type KeyVaultAad } from "@/lib/key-vault";
import {
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/_shared/validation";

/**
 * Per-user BYO AI-key settings. The principal is ALWAYS the verified session
 * userId (withAuth) — never client input. The raw key is NEVER returned to the
 * client, NEVER logged, NEVER stored in plaintext; only the `v1:…` encrypted
 * blob (apps/web/lib/key-vault.ts) + the display-only `last4` are persisted.
 *
 * GET  /api/user/api-keys
 *   → { anthropic: { configured: true, last4 } | null, groq: … | null }
 *
 * PUT  /api/user/api-keys
 *   body: { provider: "anthropic" | "groq", key: string }
 *   → { configured: true, last4 }   (400 on bad format, 503 if encryption unset)
 *
 * DELETE /api/user/api-keys?provider=anthropic
 *   → { configured: false }
 */

export const runtime = "nodejs"; // node:crypto (key-vault) needs the Node runtime.

const PutSchema = z.object({
  provider: z.enum(["anthropic", "groq"]),
  key: z.string().min(8).max(500),
});

/** Cheap provider-prefix sanity check (a real key is verified on first use). */
function validateKeyFormat(
  provider: "anthropic" | "groq",
  key: string,
): string | null {
  const trimmed = key.trim();
  if (!trimmed) return "Key is empty";
  if (provider === "anthropic" && !trimmed.startsWith("sk-ant-")) {
    return "Anthropic keys must start with 'sk-ant-'";
  }
  if (provider === "groq" && !trimmed.startsWith("gsk_")) {
    return "Groq keys must start with 'gsk_'";
  }
  return null;
}

export const GET = withAuth(async (_request, { userId }) => {
  const row = await getUserApiKeyRow(userId);
  return NextResponse.json({
    anthropic: row?.anthropicKeyEncrypted
      ? { configured: true, last4: row.anthropicLast4 ?? "" }
      : null,
    groq: row?.groqKeyEncrypted
      ? { configured: true, last4: row.groqLast4 ?? "" }
      : null,
  });
});

export const PUT = withAuth(async (request, { userId }) => {
  const json = await parseJsonBody(request);
  if (!json.ok) return json.response;

  const parsed = PutSchema.safeParse(json.body);
  if (!parsed.success) {
    return zodErrorResponse("api-keys PUT", parsed.error);
  }

  const { provider } = parsed.data;
  const trimmed = parsed.data.key.trim();
  const formatError = validateKeyFormat(provider, trimmed);
  if (formatError) {
    return NextResponse.json({ error: formatError }, { status: 400 });
  }

  const aad: KeyVaultAad = { userId, provider };
  let encrypted: string;
  try {
    encrypted = encryptKey(trimmed, aad);
  } catch (e) {
    // The only way encryptKey throws here is a missing/malformed master secret.
    // Log the ERROR (never the plaintext key) and tell the client it's a server
    // config problem, not their input.
    console.error("[api-keys] encryption failed:", e);
    return NextResponse.json(
      { error: "Server encryption is not configured" },
      { status: 503 },
    );
  }

  const last4 = lastFourOf(trimmed);
  await setUserApiKey(userId, provider, encrypted, last4);

  console.log(`[AUDIT] api-key set: user=${userId}, provider=${provider}`);

  return NextResponse.json({ configured: true, last4 });
});

export const DELETE = withAuth(async (request, { userId }) => {
  const url = new URL(request.url);
  const provider = url.searchParams.get("provider");
  if (provider !== "anthropic" && provider !== "groq") {
    return NextResponse.json(
      { error: "provider query param must be 'anthropic' or 'groq'" },
      { status: 400 },
    );
  }

  await clearUserApiKey(userId, provider);

  console.log(`[AUDIT] api-key clear: user=${userId}, provider=${provider}`);
  return NextResponse.json({ configured: false });
});
