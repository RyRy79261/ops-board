import { getMission } from "@opsboard/db/missions";
import { getResearchNoteSummariesByMissionId } from "@opsboard/db/research";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/missions/[missionId]/research-notes — per-task kept-note
// summaries across a mission (counts + latest job). REST mirror of
// read_research_notes by missionId; fetch full content per task via
// /api/v1/tasks/[taskId]/research-notes.

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.read_research_notes",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");
      const summaries = await getResearchNoteSummariesByMissionId(
        missionId,
        p.userId,
      );
      return { missionId, summaries, count: summaries.length };
    },
  });
}
