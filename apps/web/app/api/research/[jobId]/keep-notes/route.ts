import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from "@/lib/auth";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";
import {
  getResearchJob,
  getResearchNotes,
  appendResearchNote,
} from "@opsboard/db/research";

// POST /api/research/[jobId]/keep-notes — the KEEP NOTES write-gate (the single
// write the research flow performs; AI output is NEVER auto-committed). It binds
// a COMPLETED job's reviewed result to its task as a task_research_notes row.
//
// INTEGRITY: the content persisted is the job's OWN server-stored result — never
// a client-supplied body — so a caller can't smuggle arbitrary notes onto a task.
// Owner-scoped (getResearchJob filters by the principal) + rate-limited.
//
// IDEMPOTENCY: keeping the same job twice (double-click / re-open) returns the
// existing note instead of appending a duplicate. (Read-then-write — a tiny
// TOCTOU window remains, as with CUE RESEARCH; a unique index on (job_id) is the
// race-proof hardening, deferred.)

export const runtime = "nodejs";

// Validate the route param at the boundary with Zod (coding guideline), rather
// than leaning on getResearchJob throwing on a non-UUID.
const JobIdParam = z.object({ jobId: z.string().uuid() });

interface KeepNotesResult {
  ok: true;
  alreadyKept: boolean;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const principalLimit = await rateLimiter.limit(`research-keep:${user.id}`, {
    limit: 30,
  });
  if (!principalLimit.ok) return rateLimited(principalLimit.retryAfterSeconds);
  const ipLimit = await rateLimiter.limit(
    `research-keep-ip:${getClientIp(req.headers)}`,
    { limit: 60 },
  );
  if (!ipLimit.ok) return rateLimited(ipLimit.retryAfterSeconds);

  const parsedParams = JobIdParam.safeParse(await params);
  if (!parsedParams.success) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  const { jobId } = parsedParams.data;

  // Load the job (owner-scoped). jobId is a validated UUID, so this won't throw.
  const job = await getResearchJob(jobId, user.id);
  if (!job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (job.state !== "complete" || !job.result) {
    return NextResponse.json(
      { error: "This research isn't ready to keep yet." },
      { status: 409 },
    );
  }

  // Idempotency: already kept for THIS job → success, no duplicate row.
  const existing = await getResearchNotes(job.taskId, user.id);
  if (existing.some((n) => n.jobId === jobId)) {
    return NextResponse.json(
      { ok: true, alreadyKept: true } satisfies KeepNotesResult,
      { status: 200 },
    );
  }

  // Persist the job's OWN reviewed result (validated against ResearchResult inside
  // appendResearchNote) as a note on the bound task.
  const res = await appendResearchNote(
    { taskId: job.taskId, jobId, content: job.result },
    user.id,
  );
  if (!res.ok) {
    return NextResponse.json({ error: res.error }, { status: 409 });
  }
  return NextResponse.json(
    { ok: true, alreadyKept: false } satisfies KeepNotesResult,
    { status: 201 },
  );
}

function rateLimited(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
