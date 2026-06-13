import { NextResponse } from "next/server";
import { z } from "zod";

import { getAuthenticatedUser } from "@/lib/auth";
import { getClientIp, rateLimiter } from "@/lib/rate-limit";
import type { CueResearchResult } from "@/lib/research-types";

import { createResearchJob } from "@opsboard/db/research";

// /api/research — the CUE RESEARCH enqueue (the first write-consent gate). Takes
// a confirmed { missionId, taskId, query }, creates the research_jobs row
// (createResearchJob verifies task ownership + mission scope), and returns the
// job id. Node runtime (neon-http driver).
//
// M4: after the row is created this is where `inngest.send({ name:
// "research/job.requested", data: { jobId, userId } })` fires the durable runner.
// For M3 the row is created `running` and awaits the runner — the surface
// confirms the enqueue; the live Running view + runner land in M4.

export const runtime = "nodejs";

const CueResearchBody = z.object({
  missionId: z.string().uuid(),
  taskId: z.string().uuid(),
  query: z.string().trim().min(1).max(280),
});

export async function POST(req: Request): Promise<Response> {
  const user = await getAuthenticatedUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const principalLimit = await rateLimiter.limit(`research-cue:${user.id}`, {
    limit: 20,
  });
  if (!principalLimit.ok) return rateLimited(principalLimit.retryAfterSeconds);
  const ipLimit = await rateLimiter.limit(
    `research-cue-ip:${getClientIp(req.headers)}`,
    { limit: 40 },
  );
  if (!ipLimit.ok) return rateLimited(ipLimit.retryAfterSeconds);

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = CueResearchBody.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Expected { missionId, taskId, query }." },
      { status: 400 },
    );
  }

  const res = await createResearchJob(
    {
      missionId: parsed.data.missionId,
      taskId: parsed.data.taskId,
      query: parsed.data.query,
    },
    user.id,
  );
  if (!res.ok) {
    // Ownership / scope failure (the task isn't this user's, or not in the
    // mission) — a client-safe 404, no detail leakage.
    return NextResponse.json({ error: res.error }, { status: 404 });
  }

  // M4: inngest.send({ name: "research/job.requested", data: { jobId: res.job.id, userId: user.id } });

  const body: CueResearchResult = { jobId: res.job.id };
  return NextResponse.json(body, { status: 201 });
}

function rateLimited(retryAfterSeconds: number): Response {
  return NextResponse.json(
    { error: "Rate limit exceeded", retryAfterSeconds },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  );
}
