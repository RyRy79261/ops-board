import "server-only";

import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth-middleware";
import { getUserAccountExport } from "@opsboard/db/account";

/**
 * GET /api/account/export — download the signed-in user's full OpsBoard data as
 * a JSON file. The principal is ALWAYS the verified session userId (withAuth);
 * the export NEVER includes raw/encrypted key material (only which providers are
 * configured). Served as an attachment so the browser downloads it.
 */
export const GET = withAuth(async (_request, { userId }) => {
  const data = await getUserAccountExport(userId);
  const body = JSON.stringify(
    { exportedAt: new Date().toISOString(), ...data },
    null,
    2,
  );
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": 'attachment; filename="opsboard-export.json"',
      "cache-control": "no-store",
    },
  });
});
