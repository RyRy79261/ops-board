import "server-only";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import {
  getUserApiKeyRow,
  markUserSetupComplete,
} from "@opsboard/db/api-keys";

/**
 * POST /api/setup/complete — flip the BYO-keys setup gate.
 *
 * This is the ONLY thing that sets `users.setup_completed_at`, and it does so
 * ONLY after verifying BOTH providers' keys are stored (the user_api_keys row
 * has a non-null anthropic AND groq encrypted blob). So the gate
 * (requireOnboardedUser, apps/web/lib/session.ts) cannot be opened without
 * keys — setup is un-bypassable.
 *
 * Auth: withAuth (verified session principal — never client input).
 *
 * Response:
 *   - both keys stored → 200 { ok: true } (and the gate is now open)
 *   - either key missing → 400 { error: "Add both keys first.", ... }
 */

export const runtime = "nodejs";

export const POST = withAuth(async (_request, { userId }) => {
  const row = await getUserApiKeyRow(userId);

  const hasAnthropic = !!row?.anthropicKeyEncrypted;
  const hasGroq = !!row?.groqKeyEncrypted;

  if (!hasAnthropic || !hasGroq) {
    return NextResponse.json(
      {
        error: "Add both keys first.",
        missing: {
          anthropic: !hasAnthropic,
          groq: !hasGroq,
        },
      },
      { status: 400 },
    );
  }

  await markUserSetupComplete(userId);

  console.log(`[AUDIT] setup complete: user=${userId}`);
  return NextResponse.json({ ok: true });
});
