import "server-only";

import { NextResponse } from "next/server";
import { z } from "zod";
import { withAuth } from "@/lib/auth-middleware";
import { deleteUserAccount } from "@opsboard/db/account";
import {
  parseJsonBody,
  zodErrorResponse,
} from "@/app/api/_shared/validation";

/**
 * DELETE /api/account — permanently delete the signed-in user's OpsBoard data.
 * The principal is ALWAYS the verified session userId (withAuth). Server-side
 * defence-in-depth: the body must echo the confirm word (`DELETE`) even though
 * the UI already gates on a type-to-confirm field.
 *
 * This wipes OpsBoard DATA only (the users row → ON DELETE CASCADE sweeps
 * missions/tasks/deps/keys/prefs/MCP tokens). Removing the Neon Auth IDENTITY is
 * the client's best-effort follow-up (authClient.deleteUser) + sign-out, since
 * it depends on the hosted Neon Auth "delete user" feature being enabled. Done
 * data-first so no failure mode leaves orphaned data.
 */
const DeleteSchema = z.object({
  confirm: z.literal("DELETE"),
});

export const DELETE = withAuth(async (request, { userId }) => {
  const json = await parseJsonBody(request);
  if (!json.ok) return json.response;

  const parsed = DeleteSchema.safeParse(json.body);
  if (!parsed.success) {
    return zodErrorResponse("account DELETE", parsed.error);
  }

  const removed = await deleteUserAccount(userId);

  console.log(`[AUDIT] account data deleted: user=${userId}, rows=${removed}`);

  return NextResponse.json({ ok: true });
});
