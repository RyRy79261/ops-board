import { keepResearchNotesForJob } from "@/lib/research-ops";
import { runV1, V1Error, notFoundV1 } from "../../../../_lib/v1";
import { requireUuid } from "../../../../_lib/schemas";

// POST /api/v1/research/jobs/[jobId]/keep-notes — persist a COMPLETED job's
// own server-stored result to its task (REST mirror of the MCP
// keep_research_notes tool; same shared flow, same research-keep budget).
// Idempotent per job. Callers must surface/review the result first — this
// call is the consent gate.

export const runtime = "nodejs";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.keep_research_notes",
    limit: { name: "research-keep", max: 30 },
    handler: async (p) => {
      const jobId = requireUuid((await params).jobId);
      const out = await keepResearchNotesForJob(jobId, p.userId);
      if (!out.ok) {
        if (out.code === "not-found") notFoundV1(out.error);
        throw new V1Error(409, out.error);
      }
      return {
        ok: true,
        taskId: out.taskId,
        jobId: out.jobId,
        noteId: out.noteId,
        alreadyKept: out.alreadyKept,
      };
    },
  });
}
