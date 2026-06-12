import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import {
  getUserPreferences,
  setUserPreferences,
} from "@opsboard/db/preferences";
import {
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/_shared/validation";

/**
 * Per-user app preferences. The principal is ALWAYS the verified session userId
 * (withAuth) — never client input. Reads apply defaults for a user with no row.
 *
 * GET   /api/user/preferences
 *   → { voiceConfirmDestructive: boolean, notifyClosingWindows: boolean }
 *
 * PATCH /api/user/preferences
 *   body: a partial of the above (at least one key)
 *   → the full resolved preferences after the upsert
 */

const PatchSchema = z
  .object({
    voiceConfirmDestructive: z.boolean().optional(),
    notifyClosingWindows: z.boolean().optional(),
  })
  // Reject an empty patch — a PATCH must change at least one field.
  .refine((p) => Object.values(p).some((v) => v !== undefined), {
    message: "At least one preference must be supplied.",
  });

export const GET = withAuth(async (_request, { userId }) => {
  const prefs = await getUserPreferences(userId);
  return NextResponse.json(prefs);
});

export const PATCH = withAuth(async (request, { userId }) => {
  const json = await parseJsonBody(request);
  if (!json.ok) return json.response;

  const parsed = PatchSchema.safeParse(json.body);
  if (!parsed.success) {
    return zodErrorResponse("preferences PATCH", parsed.error);
  }

  const prefs = await setUserPreferences(userId, parsed.data);
  return NextResponse.json(prefs);
});
