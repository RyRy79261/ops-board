import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  blockingDependencyIds,
  deriveBlocked,
  isBlocked,
} from "../blocked";
import { buildDependencyMap, type DependencyEdge } from "../cycle";
import type { BlockedTask } from "../blocked";
import { deps, makeTasks } from "./factory";

describe("deriveBlocked — basic", () => {
  it("a task with no dependencies is never blocked", () => {
    const tasks = makeTasks([{ id: "a", status: "not-started" }]);
    const blocked = deriveBlocked(tasks, []);
    expect(blocked.get("a")).toBe(false);
  });

  it("is blocked when a dependency is not done", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "in-progress" },
    ]);
    const blocked = deriveBlocked(tasks, deps([["a", "b"]]));
    expect(blocked.get("a")).toBe(true);
    expect(blocked.get("b")).toBe(false);
  });

  it("is NOT blocked when all dependencies are done", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "done" },
      { id: "c", status: "done" },
    ]);
    const blocked = deriveBlocked(tasks, deps([["a", "b"], ["a", "c"]]));
    expect(blocked.get("a")).toBe(false);
  });

  it("is blocked if ANY one of several dependencies is not done", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "done" },
      { id: "c", status: "not-started" },
    ]);
    const blocked = deriveBlocked(tasks, deps([["a", "b"], ["a", "c"]]));
    expect(blocked.get("a")).toBe(true);
  });

  it("every task gets an entry, defaulting to false", () => {
    const tasks = makeTasks([
      { id: "a", status: "done" },
      { id: "b", status: "not-started" },
    ]);
    const blocked = deriveBlocked(tasks, []);
    expect([...blocked.keys()].sort()).toEqual(["a", "b"]);
  });
});

describe("deriveBlocked — corrupt / edge data", () => {
  it("a dependency on an UNKNOWN id counts as not-done → blocks (dangling edge)", () => {
    const tasks = makeTasks([{ id: "a", status: "not-started" }]);
    const blocked = deriveBlocked(tasks, deps([["a", "ghost"]]));
    expect(blocked.get("a")).toBe(true);
    // The ghost id is not a task, so it has no entry in the result.
    expect(blocked.has("ghost")).toBe(false);
  });

  it("a self-dependency blocks unless the task itself is done", () => {
    const notDone = makeTasks([{ id: "a", status: "in-progress" }]);
    expect(deriveBlocked(notDone, deps([["a", "a"]])).get("a")).toBe(true);
    const done = makeTasks([{ id: "a", status: "done" }]);
    expect(deriveBlocked(done, deps([["a", "a"]])).get("a")).toBe(false);
  });

  it("does not hang on a 2-cycle (a→b→a)", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "not-started" },
    ]);
    const blocked = deriveBlocked(tasks, deps([["a", "b"], ["b", "a"]]));
    expect(blocked.get("a")).toBe(true);
    expect(blocked.get("b")).toBe(true);
  });

  it("collapses duplicate edges (idempotent)", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "done" },
    ]);
    const blocked = deriveBlocked(
      tasks,
      deps([["a", "b"], ["a", "b"], ["a", "b"]]),
    );
    expect(blocked.get("a")).toBe(false);
  });
});

describe("isBlocked", () => {
  it("reads a derived map", () => {
    const map = new Map([["a", true], ["b", false]]);
    expect(isBlocked("a", map)).toBe(true);
    expect(isBlocked("b", map)).toBe(false);
    expect(isBlocked("missing", map)).toBe(false);
  });
});

describe("blockingDependencyIds", () => {
  it("lists only the not-done dependencies", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "done" },
      { id: "c", status: "in-progress" },
      { id: "d", status: "not-started" },
    ]);
    const blockers = blockingDependencyIds(
      "a",
      tasks,
      deps([["a", "b"], ["a", "c"], ["a", "d"]]),
    );
    expect(blockers.sort()).toEqual(["c", "d"]);
  });

  it("returns [] for an unblocked task", () => {
    const tasks = makeTasks([
      { id: "a", status: "not-started" },
      { id: "b", status: "done" },
    ]);
    expect(blockingDependencyIds("a", tasks, deps([["a", "b"]]))).toEqual([]);
  });

  it("includes a dangling dependency id as a blocker", () => {
    const tasks = makeTasks([{ id: "a", status: "not-started" }]);
    expect(blockingDependencyIds("a", tasks, deps([["a", "ghost"]]))).toEqual([
      "ghost",
    ]);
  });
});

// ---------------------------------------------------------------------------
// PROPERTY TESTS — the blocked invariant.
// ---------------------------------------------------------------------------

/** Arbitrary task list (1–8 tasks, unique ids, random statuses). */
const arbTasks = fc
  .uniqueArray(fc.constantFrom(..."abcdefgh".split("")), {
    minLength: 1,
    maxLength: 8,
  })
  .chain((ids) =>
    fc.record({
      ids: fc.constant(ids),
      statuses: fc.array(
        fc.constantFrom<"not-started" | "in-progress" | "done">(
          "not-started",
          "in-progress",
          "done",
        ),
        { minLength: ids.length, maxLength: ids.length },
      ),
    }),
  )
  .map(({ ids, statuses }): BlockedTask[] =>
    ids.map((id, i) => ({ id, status: statuses[i] ?? "not-started" })),
  );

/** Arbitrary edges drawn from the task ids (may include cycles + self-deps). */
const arbDeps = (ids: string[]) =>
  fc.array(
    fc.tuple(fc.constantFrom(...ids), fc.constantFrom(...ids)),
    { maxLength: 16 },
  ) as fc.Arbitrary<readonly [string, string][]>;

describe("deriveBlocked — property: blocked iff a non-done dependency exists", () => {
  it("holds the invariant for arbitrary graphs (incl. cycles/self-deps)", () => {
    fc.assert(
      fc.property(
        arbTasks.chain((tasks) =>
          arbDeps(tasks.map((t) => t.id)).map(
            (pairs) => ({ tasks, pairs }) as const,
          ),
        ),
        ({ tasks, pairs }) => {
          const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
            task_id: t,
            depends_on_id: d,
          }));
          const blocked = deriveBlocked(tasks, edges);
          const adjacency = buildDependencyMap(edges);
          const statusById = new Map(tasks.map((t) => [t.id, t.status]));

          for (const task of tasks) {
            const dependencyIds = adjacency.get(task.id) ?? new Set<string>();
            // Ground-truth: exists a direct dependency that is not 'done'.
            const expected = [...dependencyIds].some(
              (id) => statusById.get(id) !== "done",
            );
            expect(blocked.get(task.id)).toBe(expected);
          }
        },
      ),
      { numRuns: 300 },
    );
  });

  it("terminates and yields one entry per task on any graph", () => {
    fc.assert(
      fc.property(
        arbTasks.chain((tasks) =>
          arbDeps(tasks.map((t) => t.id)).map(
            (pairs) => ({ tasks, pairs }) as const,
          ),
        ),
        ({ tasks, pairs }) => {
          const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
            task_id: t,
            depends_on_id: d,
          }));
          const blocked = deriveBlocked(tasks, edges);
          expect(blocked.size).toBe(new Set(tasks.map((t) => t.id)).size);
        },
      ),
      { numRuns: 200 },
    );
  });
});
