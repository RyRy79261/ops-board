import { describe, expect, it } from "vitest";
import fc from "fast-check";

import { buildDependencyMap, detectCycles, hasCycle } from "../cycle";
import type { DependencyEdge } from "../cycle";
import { deps } from "./factory";

/** Normalize a set of cycles for order-independent comparison. */
function cycleKeys(cycles: string[][]): Set<string> {
  return new Set(cycles.map((c) => c.join(">")));
}

describe("buildDependencyMap", () => {
  it("collapses duplicate edges and registers both endpoints as nodes", () => {
    const map = buildDependencyMap(deps([["a", "b"], ["a", "b"]]));
    expect([...(map.get("a") ?? [])]).toEqual(["b"]);
    expect(map.has("b")).toBe(true); // dependency-only node still present
    expect([...(map.get("b") ?? [])]).toEqual([]);
  });
});

describe("detectCycles", () => {
  it("finds nothing in an acyclic chain", () => {
    expect(detectCycles(deps([["a", "b"], ["b", "c"]]))).toEqual([]);
    expect(hasCycle(deps([["a", "b"], ["b", "c"]]))).toBe(false);
  });

  it("finds nothing in a diamond (a→b, a→c, b→d, c→d)", () => {
    expect(
      detectCycles(deps([["a", "b"], ["a", "c"], ["b", "d"], ["c", "d"]])),
    ).toEqual([]);
  });

  it("detects a self-dependency as a one-node cycle", () => {
    expect(detectCycles(deps([["a", "a"]]))).toEqual([["a"]]);
    expect(hasCycle(deps([["a", "a"]]))).toBe(true);
  });

  it("detects a 2-cycle (a→b→a)", () => {
    const cycles = detectCycles(deps([["a", "b"], ["b", "a"]]));
    expect(cycles).toHaveLength(1);
    // Normalized to start at the smallest id.
    expect(cycles[0]).toEqual(["a", "b"]);
  });

  it("detects a 3-cycle (a→b→c→a)", () => {
    const cycles = detectCycles(deps([["a", "b"], ["b", "c"], ["c", "a"]]));
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["a", "b", "c"]);
  });

  it("reports the same loop once regardless of traversal entry point", () => {
    // The same 3-cycle plus an extra inbound edge giving a second entry.
    const cycles = detectCycles(
      deps([["a", "b"], ["b", "c"], ["c", "a"], ["x", "b"]]),
    );
    expect(cycles).toHaveLength(1);
    expect(cycles[0]).toEqual(["a", "b", "c"]);
  });

  it("detects two independent cycles", () => {
    const cycles = detectCycles(
      deps([["a", "b"], ["b", "a"], ["c", "d"], ["d", "c"]]),
    );
    expect(cycleKeys(cycles)).toEqual(new Set(["a>b", "c>d"]));
  });

  it("detects a self-dep AND a separate 2-cycle together", () => {
    const cycles = detectCycles(deps([["s", "s"], ["a", "b"], ["b", "a"]]));
    expect(cycleKeys(cycles)).toEqual(new Set(["s", "a>b"]));
  });

  it("does not hang on a fully-connected tangle", () => {
    const ids = ["a", "b", "c", "d"];
    const all: DependencyEdge[] = [];
    for (const t of ids)
      for (const d of ids) all.push({ task_id: t, depends_on_id: d });
    // Just assert it returns (terminates) and finds at least the self-deps.
    const cycles = detectCycles(all);
    expect(cycles.length).toBeGreaterThan(0);
    expect(cycles.some((c) => c.length === 1)).toBe(true); // self-deps present
  });

  it("handles an empty graph", () => {
    expect(detectCycles([])).toEqual([]);
    expect(hasCycle([])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// PROPERTY TEST — detectCycles always terminates and never invents a cycle.
// ---------------------------------------------------------------------------

describe("detectCycles — property: terminates; hasCycle agrees", () => {
  const arbEdges = fc.array(
    fc.tuple(
      fc.constantFrom(..."abcde".split("")),
      fc.constantFrom(..."abcde".split("")),
    ),
    { maxLength: 20 },
  );

  it("never hangs and hasCycle === (cycles.length > 0) on arbitrary graphs", () => {
    fc.assert(
      fc.property(arbEdges, (pairs) => {
        const edges: DependencyEdge[] = pairs.map(([t, d]) => ({
          task_id: t,
          depends_on_id: d,
        }));
        const cycles = detectCycles(edges);
        expect(hasCycle(edges)).toBe(cycles.length > 0);
        // Each reported cycle's edges must all actually exist in the graph.
        const edgeSet = new Set(
          edges.map((e) => `${e.task_id}>${e.depends_on_id}`),
        );
        for (const cycle of cycles) {
          for (let i = 0; i < cycle.length; i++) {
            const from = cycle[i];
            const to = cycle[(i + 1) % cycle.length];
            expect(edgeSet.has(`${from}>${to}`)).toBe(true);
          }
        }
      }),
      { numRuns: 300 },
    );
  });
});
