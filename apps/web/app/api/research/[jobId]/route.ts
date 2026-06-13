import { NextResponse } from "next/server";

import { getAuthenticatedUser } from "@/lib/auth";
import type { ResearchJobView } from "@/lib/research-types";
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
  const job = await getResearchJob(jobId, user.id);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body: ResearchJobView = {
    id: job.id,
    state: job.state,
    query: job.query,
    steps: job.steps,
    result: job.result ?? null,
    errorMessage: job.errorMessage,
    taskId: job.taskId,
    createdAt: job.createdAt.toISOString(),
    completedAt: job.completedAt ? job.completedAt.toISOString() : null,
  };
  return NextResponse.json(body, { status: 200 });
}
