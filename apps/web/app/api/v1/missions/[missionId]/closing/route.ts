import { getMission } from "@opsboard/db/missions";
import { getTasks, getTaskDependencies } from "@opsboard/db/tasks";
import {
  deriveBlocked,
  windowStateDetail,
  CLOSING_THRESHOLD_DAYS,
} from "@opsboard/core";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/missions/[missionId]/closing?daysAhead=&tz= — mirror of the MCP
// get_closing_windows tool for one mission: tasks whose too_late_by cliff
// falls within `daysAhead` days (default 7). `now` is the server clock and
// `tz` a validated IANA zone (default UTC) — @opsboard/core stays I/O-free.

export const runtime = "nodejs";

const MAX_DAYS_AHEAD = 365;

export async function GET(
  req: Request,
  { params }: { params: Promise<{ missionId: string }> },
): Promise<Response> {
  const url = new URL(req.url);
  return runV1({
    req,
    op: "v1.get_closing_windows",
    handler: async (p) => {
      const missionId = requireUuid((await params).missionId);
      const mission = await getMission(missionId, p.userId);
      if (!mission) notFoundV1("No mission with that id.");

      const rawDays = Number(url.searchParams.get("daysAhead"));
      const daysAhead =
        Number.isInteger(rawDays) && rawDays >= 0 && rawDays <= MAX_DAYS_AHEAD
          ? rawDays
          : CLOSING_THRESHOLD_DAYS;
      let tz = url.searchParams.get("tz") ?? "UTC";
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: tz });
      } catch {
        tz = "UTC";
      }

      const now = Date.now();
      const tasks = await getTasks(missionId, p.userId);
      const edges = await getTaskDependencies(missionId, p.userId);
      const blockedMap = deriveBlocked(
        tasks.map((t) => ({
          id: t.id,
          status: t.status as "not-started" | "in-progress" | "done",
        })),
        edges.map((e) => ({ task_id: e.taskId, depends_on_id: e.dependsOnId })),
      );

      const closingTasks = tasks
        .map((t) => ({
          task: t,
          detail: windowStateDetail(
            now,
            {
              too_late_by: t.tooLateBy,
              not_before: t.notBefore,
              blocked: blockedMap.get(t.id) === true,
            },
            tz,
          ),
        }))
        .filter(
          ({ detail }) =>
            detail.daysUntilClose !== null &&
            detail.daysUntilClose <= daysAhead,
        )
        .map(({ task, detail }) => ({
          id: task.id,
          name: task.name,
          missionId: task.missionId,
          tooLateBy: task.tooLateBy,
          state: detail.state,
          reason: detail.reason,
          daysUntilClose: detail.daysUntilClose,
        }))
        .sort((a, b) => (a.daysUntilClose ?? 0) - (b.daysUntilClose ?? 0));

      return { missionId, closingTasks, count: closingTasks.length, daysAhead };
    },
  });
}
