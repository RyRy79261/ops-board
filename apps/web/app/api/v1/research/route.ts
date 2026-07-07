import { z } from "zod";
import { cueResearchForTask } from "@/lib/research-ops";
import { runV1, safeParseBody, V1Error, notFoundV1 } from "../_lib/v1";
import { uuid, researchQuery, researchFocus } from "../_lib/schemas";

// POST /api/v1/research — cue a research job (REST mirror of the MCP
// cue_research tool; same shared flow in @/lib/research-ops, same
// research-cue:{userId} budget as the voice route and MCP tool). missionId is
// derived from the task. Each cue spends the caller's own Anthropic tokens.

export const runtime = "nodejs";

const CueBody = z.object({
  taskId: uuid,
  query: researchQuery,
  focus: researchFocus.optional(),
});

export async function POST(req: Request): Promise<Response> {
  const body = await safeParseBody(req, CueBody);
  if (!body.ok) return body.response;
  return runV1({
    req,
    op: "v1.cue_research",
    argsForAudit: body.data,
    limit: { name: "research-cue", max: 20 },
    successStatus: 201,
    handler: async (p) => {
      const out = await cueResearchForTask(body.data, p.userId);
      if (!out.ok) {
        if (out.code === "not-found") notFoundV1(out.error);
        if (out.code === "no-key") throw new V1Error(402, out.error, "NO_AI_KEY");
        if (out.code === "enqueue-failed") throw new V1Error(502, out.error);
        throw new V1Error(404, out.error);
      }
      return {
        jobId: out.jobId,
        taskId: out.taskId,
        state: "running" as const,
        alreadyRunning: out.alreadyRunning,
      };
    },
  });
}
