import type { DependencyEdge } from "./cycle";
import { buildDependencyMap } from "./cycle";

// Pure critical-path derivation: the LONGEST dependency chain in the graph
// (toward a target task when given, else across the whole graph). This is the
// chain the Dependencies view highlights in orange. I/O-FREE and, above all,
// CYCLE-SAFE — a cyclic graph must NOT loop forever. We achieve that with a
// memoized DFS guarded by a recursion-stack set: a back-edge is simply not
// followed, so the longest *acyclic* chain is returned even on a tangled graph.
// "Domain-impossible is not a defence."

/** Minimal task shape critical-path needs. */
export interface PathTask {
  id: string;
}

/**
 * The longest dependency chain in the graph, returned as an ordered list of ids
 * from the highest-level task DOWN to its deepest prerequisite (i.e. dependents
 * first, the leaf dependency last). Empty graph → `[]`.
 *
 * - **`targetId` given**: the longest chain that *starts at* `targetId` and
 *   walks its (transitive) dependencies — the brief's "longest dependency chain
 *   to target". If `targetId` isn't a known node, returns `[]`.
 * - **`targetId` omitted**: the longest chain anywhere in the graph.
 *
 * Cycle handling: a node already on the current DFS path is not re-entered, so
 * the walk always terminates; the reported chain is the longest one with no
 * repeated node. Ties are broken deterministically (lexicographic on the next
 * id) so the result is stable across runs.
 */
export function criticalPath(
  tasks: readonly PathTask[],
  deps: readonly DependencyEdge[],
  targetId?: string,
): string[] {
  const adjacency = buildDependencyMap(deps);

  // Known node set = tasks ∪ any id mentioned by an edge. We still only START
  // from real tasks, but may traverse into edge-only ids (dangling deps) so the
  // chain length reflects the actual graph.
  const known = new Set<string>(adjacency.keys());
  for (const task of tasks) known.add(task.id);

  // Longest acyclic chain STARTING at `node`, given the nodes already on the
  // current path (which must not be re-entered — that is the cycle guard, and
  // why this is intentionally NOT memoized across start points: under cycles a
  // node's longest downward chain genuinely depends on which ancestors are
  // already on the path). At OpsBoard's scale (10–30 nodes, per the brief) the
  // exhaustive descent is cheap; the `onPath` guard bounds depth by node count
  // so it always terminates.
  const longestFrom = (node: string, onPath: Set<string>): string[] => {
    onPath.add(node);
    const neighbours = [...(adjacency.get(node) ?? [])].sort();

    let best: string[] = [];
    for (const next of neighbours) {
      if (next === node) continue; // self-dep: ignore the back-edge
      if (onPath.has(next)) continue; // cycle back-edge: do not follow
      if (!known.has(next)) continue;
      const sub = longestFrom(next, onPath);
      if (
        sub.length > best.length ||
        (sub.length === best.length &&
          sub.length > 0 &&
          compareChains(sub, best) < 0)
      ) {
        best = sub;
      }
    }

    onPath.delete(node);
    return [node, ...best];
  };

  if (targetId !== undefined) {
    if (!known.has(targetId)) return [];
    return longestFrom(targetId, new Set<string>());
  }

  let overall: string[] = [];
  // Deterministic start order so the global longest path is stable on ties.
  const starts = [...known].sort();
  for (const start of starts) {
    const chain = longestFrom(start, new Set<string>());
    if (
      chain.length > overall.length ||
      (chain.length === overall.length &&
        chain.length > 0 &&
        compareChains(chain, overall) < 0)
    ) {
      overall = chain;
    }
  }
  return overall;
}

/** The depth (edge count) of the longest dependency chain from `targetId`. */
export function criticalPathLength(
  tasks: readonly PathTask[],
  deps: readonly DependencyEdge[],
  targetId?: string,
): number {
  const path = criticalPath(tasks, deps, targetId);
  return path.length === 0 ? 0 : path.length - 1;
}

/** Lexicographic compare of two id chains, for deterministic tie-breaking. */
function compareChains(a: readonly string[], b: readonly string[]): number {
  const len = Math.min(a.length, b.length);
  for (let i = 0; i < len; i++) {
    const x = a[i];
    const y = b[i];
    if (x === undefined || y === undefined) break;
    if (x < y) return -1;
    if (x > y) return 1;
  }
  return a.length - b.length;
}
