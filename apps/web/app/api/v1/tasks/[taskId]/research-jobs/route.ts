import { getTask } from "@opsboard/db/tasks";
import { getResearchJobsForTask } from "@opsboard/db/research";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/tasks/[taskId]/research-jobs — a task's research jobs, newest
// first, summaries only (REST mirror of the MCP list_research_jobs tool).

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.list_research_jobs",
    handler: async (p) => {
      const taskId = requireUuid((await params).taskId);
      const task = await getTask(taskId, p.userId);
      if (!task) notFoundV1("No task with that id.");
      const jobs = await getResearchJobsForTask(taskId, p.userId);
      return {
        taskId,
        jobs: jobs.map((j) => ({
          jobId: j.id,
          state: j.state,
          query: j.query,
          createdAt: j.createdAt.toISOString(),
          completedAt: j.completedAt ? j.completedAt.toISOString() : null,
        })),
        count: jobs.length,
      };
    },
  });
}
