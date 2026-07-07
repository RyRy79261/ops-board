import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthenticatedUser } from "@/lib/auth";
import { revokeClientApiKey } from "@opsboard/db/client-api-keys";

// DELETE /api/user/access-keys/[keyId] — revoke a programmatic API key.
// Session-only (Settings UI), idempotent, owner-scoped: a foreign key id
// reads as not-found. Revocation is immediate — the /api/v1 verifier only
// matches non-revoked rows.

export const runtime = "nodejs";

const KeyIdParam = z.object({ keyId: z.uuid() });

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ keyId: string }> },
): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = KeyIdParam.safeParse(await params);
  if (!parsed.success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const res = await revokeClientApiKey(parsed.data.keyId, user.id);
  if (!res.ok) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    ok: true,
    keyId: parsed.data.keyId,
    revokedAt: res.key.revokedAt ? res.key.revokedAt.toISOString() : null,
  });
}
