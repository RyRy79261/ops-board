import { getTask } from "@opsboard/db/tasks";
import { getResearchNotes } from "@opsboard/db/research";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/tasks/[taskId]/research-notes — the task's KEPT research notes
// (full cited content), newest first. REST mirror of read_research_notes by
// taskId.

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ taskId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.read_research_notes",
    handler: async (p) => {
      const taskId = requireUuid((await params).taskId);
      const task = await getTask(taskId, p.userId);
      if (!task) notFoundV1("No task with that id.");
      const notes = await getResearchNotes(taskId, p.userId);
      return {
        taskId,
        notes: notes.map((n) => ({
          noteId: n.id,
          jobId: n.jobId,
          createdAt: n.createdAt.toISOString(),
          content: n.content,
        })),
        count: notes.length,
      };
    },
  });
}
