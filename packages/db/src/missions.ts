import { and, asc, eq } from "drizzle-orm";
import { createHttpDb } from "./index";
import type { OpsboardDb } from "./index";
import * as schema from "./schema";
import type { Mission, Task } from "./schema";

// @opsboard/db/missions — read query services for the read-only board. Each
// returns an explicit interface (not a raw Drizzle row), uses createHttpDb,
// and maps rows so callers never depend on column internals. Mutations live
// in ./tasks.ts (the single status-cycle Server Action mutation).

/** A mission row, board-shaped. */
export interface MissionView {
  id: string;
  name: string;
  /** "YYYY-MM-DD" or null — the fixed real-world event date. */
  targetDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/** A mission together with all of its tasks (for the mission detail / board). */
export interface MissionWithTasks extends MissionView {
  tasks: Task[];
}

function toMissionView(row: Mission): MissionView {
  return {
    id: row.id,
    name: row.name,
    targetDate: row.targetDate,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/** All of `userId`'s missions, alphabetically by name. */
export async function getMissions(
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MissionView[]> {
  const rows = await db
    .select()
    .from(schema.missions)
    .where(eq(schema.missions.userId, userId))
    .orderBy(asc(schema.missions.name));
  return rows.map(toMissionView);
}

/** One of `userId`'s missions by id, or null if it doesn't exist / isn't theirs. */
export async function getMission(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MissionView | null> {
  const [row] = await db
    .select()
    .from(schema.missions)
    .where(and(eq(schema.missions.id, id), eq(schema.missions.userId, userId)))
    .limit(1);
  return row ? toMissionView(row) : null;
}

/**
 * One of `userId`'s missions plus its tasks (sorted by `sort_order`, then
 * name). Returns null when the mission doesn't exist or isn't theirs. Both the
 * mission AND its tasks are scoped by userId. The dependency graph and the
 * derived blocked / window state are computed separately in @opsboard/core
 * from getTasks + getTaskDependencies (./tasks.ts).
 */
export async function getMissionWithTasks(
  id: string,
  userId: string,
  db: OpsboardDb = createHttpDb(),
): Promise<MissionWithTasks | null> {
  const [mission] = await db
    .select()
    .from(schema.missions)
    .where(and(eq(schema.missions.id, id), eq(schema.missions.userId, userId)))
    .limit(1);
  if (!mission) return null;

  const tasks = await db
    .select()
    .from(schema.tasks)
    .where(
      and(
        eq(schema.tasks.missionId, id),
        eq(schema.tasks.userId, userId),
      ),
    )
    .orderBy(asc(schema.tasks.sortOrder), asc(schema.tasks.name));

  return { ...toMissionView(mission), tasks };
}
