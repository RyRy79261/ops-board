import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import { toResearchJobView } from "@/lib/research-types";
import { getResearchJob } from "@opsboard/db/research";

// GET /api/research/[jobId] — owner-scoped job poll for the live Running surface.
// The client polls this every couple of seconds while a job runs; the durable
// Inngest runner advances the row in Neon out-of-band. Node runtime (neon-http).
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { jobId } = await params;

  // getResearchJob throws on a non-UUID id; a malformed/unknown job is a 404,
  // not a 500 (mirrors the /research/[jobId] page guard).
  let job: Awaited<ReturnType<typeof getResearchJob>>;
  try {
    job = await getResearchJob(jobId, user.id);
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(toResearchJobView(job), { status: 200 });
}
