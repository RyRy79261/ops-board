import { describe, expect, it } from "vitest";
import fc from "fast-check";

import {
  criticalPath,
  criticalPathLength,
  type PathTask,
} from "../critical-path";
import { buildDependencyMap, type DependencyEdge } from "../cycle";
import { deps, makeTasks } from "./factory";

const tasksFrom = (ids: string[]): PathTask[] =>
  makeTasks(ids.map((id) => ({ id }))).map((t) => ({ id: t.id }));

describe("criticalPath — basic", () => {
  it("returns [] for an empty graph", () => {
    expect(criticalPath([], [])).toEqual([]);
    expect(criticalPathLength([], [])).toBe(0);
  });

  it("a single task with no deps is its own (length-0) path", () => {
    expect(criticalPath(tasksFrom(["a"]), [])).toEqual(["a"]);
    expect(criticalPathLength(tasksFrom(["a"]), [])).toBe(0);
  });

  it("returns the longest chain in a simple line (a→b→c)", () => {
    const tasks = tasksFrom(["a", "b", "c"]);
    const edges = deps([["a", "b"], ["b", "c"]]);
    expect(criticalPath(tasks, edges)).toEqual(["a", "b", "c"]);
    expect(criticalPathLength(tasks, edges)).toBe(2);
  });

  it("picks the longer of two branches", () => {
    // a→b (short)  and  a→c→d→e (long)
    const tasks = tasksFrom(["a", "b", "c", "d", "e"]);
    const edges = deps([
      ["a", "b"],
      ["a", "c"],
      ["c", "d"],
      ["d", "e"],
    ]);
    expect(criticalPath(tasks, edges)).toEqual(["a", "c", "d", "e"]);
    expect(criticalPathLength(tasks, edges)).toBe(3);
  });

  it("targets a specific task's longest dependency chain", () => {
    // target b → b→c→d ; a is a longer chain but not from b.
    const tasks = tasksFrom(["a", "b", "c", "d", "z"]);
    const edges = deps([
      ["a", "z"],
      ["b", "c"],
      ["c", "d"],
    ]);
    expect(criticalPath(tasks, edges, "b")).toEqual(["b", "c", "d"]);
    expect(criticalPathLength(tasks, edges, "b")).toBe(2);
  });

  it("returns [] for an unknown target", () => {
    expect(criticalPath(tasksFrom(["a"]), [], "ghost")).toEqual([]);
  });

  it("breaks ties deterministically (lexicographic)", () => {
    // a→b and a→c, both length-1 chains; b < c so a→b wins.
    const tasks = tasksFrom(["a", "b", "c"]);
    const edges = deps([["a", "b"], ["a", "c"]]);
    expect(criticalPath(tasks, edges, "a")).toEqual(["a", "b"]);
  });
});

describe("criticalPath — cycle safety", () => {
  it("does not loop forever on a 2-cycle (a→b→a)", () => {
    const tasks = tasksFrom(["a", "b"]);
    const edges = deps([["a", "b"], ["b", "a"]]);
    const path = criticalPath(tasks, edges, "a");
    // Longest acyclic chain from a: a→b (the back-edge b→a is not followed).
    expect(path).toEqual(["a", "b"]);
    // No id repeats.
    expect(new Set(path).size).toBe(path.length);
  });

  it("does not loop forever on a self-dep (a→a)", () => {
    const tasks = tasksFrom(["a"]);
    const path = criticalPath(tasks, deps([["a", "a"]]), "a");
    expect(path).toEqual(["a"]);
  });

  it("does not loop forever on a 3-cycle and returns an acyclic chain", () => {
    const tasks = tasksFrom(["a", "b", "c"]);
    const edges = deps([["a", "b"], ["b", "c"], ["c", "a"]]);
    const path = criticalPath(tasks, edges, "a");
    expect(path).toEqual(["a", "b", "c"]);
    expect(new Set(path).size).toBe(path.length);
  });

  it("walks into a dangling dependency id (edge-only node)", () => {
    const tasks = tasksFrom(["a"]);
    const path = criticalPath(tasks, deps([["a", "ghost"]]), "a");
    expect(path).toEqual(["a", "ghost"]);
  });
});

// ---------------------------------------------------------------------------
// PROPERTY TESTS — criticalPath returns a VALID chain and ALWAYS terminates,
// even on cyclic graphs.
// ---------------------------------------------------------------------------

describe("criticalPath — property: valid acyclic chain, terminates on cycles", () => {
  const ids = "abcde".split("");
  const arbEdges = fc.array(
    fc.tuple(fc.constantFrom(...ids), fc.constantFrom(...ids)),
    { maxLength: 18 },
  );

  it("returns a chain that is a real path with no repeated node", () => {
    fc.assert(
      fc.property(arbEdges, fc.constantFrom(...ids), (pairs, target) => {
        const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
          task_id: t,
          depends_on_id: d,
        }));
        const tasks = tasksFrom(ids);
        const adjacency = buildDependencyMap(edges);

        const path = criticalPath(tasks, edges, target);

        if (path.length === 0) return; // unknown target only — but target is known
        // 1. starts at the target.
        expect(path[0]).toBe(target);
        // 2. no repeated node (acyclic).
        expect(new Set(path).size).toBe(path.length);
        // 3. every consecutive pair is a real edge.
        for (let i = 0; i + 1 < path.length; i++) {
          const from = path[i];
          const to = path[i + 1];
          expect(from !== undefined && adjacency.get(from)?.has(to!)).toBe(
            true,
          );
        }
      }),
      { numRuns: 400 },
    );
  });

  it("the global longest path is at least as long as any targeted one", () => {
    fc.assert(
      fc.property(arbEdges, (pairs) => {
        const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
          task_id: t,
          depends_on_id: d,
        }));
        const tasks = tasksFrom(ids);
        const global = criticalPath(tasks, edges);
        for (const id of ids) {
          expect(criticalPath(tasks, edges, id).length).toBeLessThanOrEqual(
            global.length,
          );
        }
      }),
      { numRuns: 200 },
    );
  });

  it("terminates within a generous time budget on dense cyclic graphs", () => {
    fc.assert(
      fc.property(arbEdges, (pairs) => {
        const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
          task_id: t,
          depends_on_id: d,
        }));
        const tasks = tasksFrom(ids);
        const start = Date.now();
        criticalPath(tasks, edges);
        // If it ever looped forever this would never reach the assertion.
        expect(Date.now() - start).toBeLessThan(1000);
      }),
      { numRuns: 100 },
    );
  });
});
