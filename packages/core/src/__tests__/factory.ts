import type { TaskStatus } from "@opsboard/types";
import type { DependencyEdge } from "../cycle";
import type { BlockedTask } from "../blocked";
import type { WindowStateTask } from "../window-state";

// Shared test factory/builder for tasks + dependency edges. Keeps the suites
// declarative — a task is described by overriding only the fields under test.

export interface FactoryTask extends BlockedTask, WindowStateTask {
  id: string;
  status: TaskStatus;
  too_late_by?: string | null;
  not_before?: string | null;
  blocked?: boolean;
}

let autoId = 0;

/** Build a task with sensible defaults; override any field. */
export function makeTask(overrides: Partial<FactoryTask> = {}): FactoryTask {
  autoId += 1;
  return {
    id: overrides.id ?? `t${autoId}`,
    status: overrides.status ?? "not-started",
    too_late_by: overrides.too_late_by ?? null,
    not_before: overrides.not_before ?? null,
    blocked: overrides.blocked,
  };
}

/** Build many tasks from id + partial overrides. */
export function makeTasks(
  specs: ReadonlyArray<Partial<FactoryTask> & { id: string }>,
): FactoryTask[] {
  return specs.map((spec) => makeTask(spec));
}

/** Build a dependency edge: `taskId` depends on `dependsOnId`. */
export function dep(taskId: string, dependsOnId: string): DependencyEdge {
  return { task_id: taskId, depends_on_id: dependsOnId };
}

/** Build many edges from `[taskId, dependsOnId]` pairs. */
export function deps(
  pairs: ReadonlyArray<readonly [string, string]>,
): DependencyEdge[] {
  return pairs.map(([taskId, dependsOnId]) => dep(taskId, dependsOnId));
}

/**
 * Epoch ms for a wall-clock instant in a specific IANA tz. Test-only helper that
 * INVERTS window-state's offset logic so tests can say "10:00 on 2026-03-10 in
 * Africa/Johannesburg" without hardcoding offsets. Mirrors the production
 * approach: render the naive UTC instant in the tz, measure the offset, correct.
 */
export function instantInTz(
  iso: string, // "YYYY-MM-DDTHH:mm:ss(.mmm)?"
  tz: string,
): number {
  const match =
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/.exec(
      iso,
    );
  if (!match) throw new Error(`bad instant: ${iso}`);
  const [, y, mo, d, h, mi, s, ms] = match;
  const wallUtc = Date.UTC(
    Number(y),
    Number(mo) - 1,
    Number(d),
    Number(h),
    Number(mi),
    s ? Number(s) : 0,
    ms ? Number(ms.padEnd(3, "0")) : 0,
  );
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const measure = (utcMs: number): number => {
    const parts = dtf.formatToParts(new Date(utcMs));
    const f: Record<string, number> = {};
    for (const p of parts) if (p.type !== "literal") f[p.type] = Number(p.value);
    const hour = f.hour === 24 ? 0 : (f.hour ?? 0);
    const asUtc = Date.UTC(
      f.year ?? 1970,
      (f.month ?? 1) - 1,
      f.day ?? 1,
      hour,
      f.minute ?? 0,
      f.second ?? 0,
    );
    return Math.round((asUtc - utcMs) / 60_000);
  };
  const offset1 = measure(wallUtc);
  const candidate = wallUtc - offset1 * 60_000;
  const offset2 = measure(candidate);
  return offset2 === offset1 ? candidate : wallUtc - offset2 * 60_000;
}
