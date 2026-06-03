import { asc, eq } from "drizzle-orm";
import { createHttpDb } from "./index";
import * as schema from "./schema";
import type { Task, TaskDependency, TaskStatus } from "./schema";

// @opsboard/db/tasks — read query services for tasks, categories, and the
// dependency graph, plus the single status-cycle mutation the S4 Server
// Action calls. Reads return explicit interfaces; the board derives blocked /
// window state from these rows in @opsboard/core (nothing derived is stored).

/** A category row, board-shaped (icon + label + hex tint). */
export interface CategoryView {
  id: string;
  slug: string;
  name: string;
  /** Hex mirror of the @opsboard/ui `--color-cat-*` token. */
  color: string;
  /** Lucide icon name (the redundant icon channel). */
  lucideIcon: string;
  sortOrder: number;
  isDefault: boolean;
}

/** One dependency edge: `taskId` depends on `dependsOnId`. */
export interface DependencyEdge {
  id: string;
  taskId: string;
  dependsOnId: string;
}

/** All categories, ordered by `sort_order` (the board iterates this, never a hardcoded array). */
export async function getCategories(): Promise<CategoryView[]> {
  const db = createHttpDb();
  const rows = await db
    .select()
    .from(schema.categories)
    .orderBy(asc(schema.categories.sortOrder), asc(schema.categories.name));
  return rows.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    color: c.color,
    lucideIcon: c.lucideIcon,
    sortOrder: c.sortOrder,
    isDefault: c.isDefault,
  }));
}

/**
 * All tasks for a mission, sorted by `sort_order` then name. Returns the raw
 * (inferred) Task rows — the board groups / buckets them and derives blocked +
 * window state via @opsboard/core.
 */
export async function getTasks(missionId: string): Promise<Task[]> {
  const db = createHttpDb();
  return db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.missionId, missionId))
    .orderBy(asc(schema.tasks.sortOrder), asc(schema.tasks.name));
}

/** One task by id, or null. */
export async function getTask(id: string): Promise<Task | null> {
  const db = createHttpDb();
  const [row] = await db
    .select()
    .from(schema.tasks)
    .where(eq(schema.tasks.id, id))
    .limit(1);
  return row ?? null;
}

/**
 * Every dependency edge for a mission's tasks. We scope by mission rather than
 * scanning the whole edge table: fetch the mission's task ids, then return the
 * edges whose `taskId` is one of them. Feeds @opsboard/core's cycle detection
 * + critical-path + blocked derivations.
 */
export async function getTaskDependencies(
  missionId: string,
): Promise<DependencyEdge[]> {
  const db = createHttpDb();

  const taskRows = await db
    .select({ id: schema.tasks.id })
    .from(schema.tasks)
    .where(eq(schema.tasks.missionId, missionId));
  const taskIds = new Set(taskRows.map((t) => t.id));
  if (taskIds.size === 0) return [];

  const edges: TaskDependency[] = await db
    .select()
    .from(schema.taskDependencies);

  return edges
    .filter((e) => taskIds.has(e.taskId))
    .map((e) => ({
      id: e.id,
      taskId: e.taskId,
      dependsOnId: e.dependsOnId,
    }));
}

/** Result of a status-cycle mutation: the updated task, or null if not found. */
export type UpdateTaskStatusResult =
  | { ok: true; task: Task }
  | { ok: false; error: string };

/**
 * Set a task's status (the S4 status-cycle Server Action). The three legal
 * values are pinned by the schema CHECK; the UI cycles
 * not-started → in-progress → done. Bumps `updated_at`. This is the only
 * mutation the read-only board needs — creation / deletion happen via voice
 * (S5) or MCP (S6).
 */
export async function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<UpdateTaskStatusResult> {
  const db = createHttpDb();
  const [row] = await db
    .update(schema.tasks)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.tasks.id, taskId))
    .returning();
  if (!row) return { ok: false, error: "Task not found." };
  return { ok: true, task: row };
}
