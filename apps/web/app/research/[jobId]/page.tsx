import { notFound } from "next/navigation";

import { getResearchJob } from "@opsboard/db/research";
import { getTask } from "@opsboard/db/tasks";
import { getMission } from "@opsboard/db/missions";

import { requireOnboardedUser } from "@/lib/session";
import type { ResearchJobView } from "@/lib/research-types";
import { ResearchRunning } from "./research-running";

// /research/[jobId] — the AI Research RUNNING surface. force-dynamic: it reads
// the live job row per request, then the client polls /api/research/[jobId] to
// stream the step log while the durable Inngest runner advances the row in Neon.
// Owner-scoped: getResearchJob filters by the verified principal, so one user can
// never open another's job. The task/mission names give the panel its BOUND-TO
// context (the job row only stores ids).

export const dynamic = "force-dynamic";
export const metadata = { title: "Researching… · OpsBoard" };

export default async function ResearchJobPage({
  params,
}: {
  // Next 16: params is a Promise.
  params: Promise<{ jobId: string }>;
}) {
  const { userId } = await requireOnboardedUser();
  const { jobId } = await params;

  // getResearchJob throws on a non-UUID id; a malformed/unknown job is a 404,
  // not a 500 — so treat both the throw and a null result as not-found.
  let job: Awaited<ReturnType<typeof getResearchJob>>;
  try {
    job = await getResearchJob(jobId, userId);
  } catch {
    notFound();
  }
  if (!job) notFound();

  const [task, mission] = await Promise.all([
    getTask(job.taskId, userId),
    getMission(job.missionId, userId),
  ]);

  const initialJob: ResearchJobView = {
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

  return (
    <ResearchRunning
      initialJob={initialJob}
      taskName={task?.name ?? "this task"}
      missionName={mission?.name ?? ""}
    />
  );
}
