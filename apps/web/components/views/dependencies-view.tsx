import { CornerDownRight } from "lucide-react";

import { TaskCard } from "@opsboard/ui/components/task-card";
import { DependencyConnector } from "@opsboard/ui/components/dependency-connector";
import { UnlinkedGroupHeader } from "@opsboard/ui/components/unlinked-group-header";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";

import type { ViewProps, TaskVM, DependencyEdgeVM } from "@/lib/dashboard-types";

// The DEPENDENCIES board view (board b1b079). Renders the mission's tasks as a
// hand-rolled, indented dependency tree (NOT a graph library) per
// docs/tech-spec/03-surfaces/dependencies.md:
//
//   • Roots (tasks with no dependencies — they depend on nothing) render first,
//     each followed by its dependents DFS'd in order. Edge `taskId depends-on
//     dependsOnId` means dependsOnId is the PREREQUISITE (parent) and taskId is
//     the DEPENDENT (child) — so the inverse adjacency (prerequisite → its
//     dependents) is what the tree walks.
//   • Each depth>0 row is prefixed with `depth × 36px` of lead block: (depth-1)
//     36px Indent spacers + a 36×38 DependencyConnector (↳). depth 0 = card only.
//   • CYCLE-SAFE: a visited-set renders every node EXACTLY once and never
//     recurses into a node already on the current DFS path (back-edge) or already
//     rendered elsewhere (shared/cross dependency) — so a cycle (A→B→A) or a
//     diamond can never loop forever or duplicate a subtree.
//   • Tasks unreachable from any root (pure cycles whose every member has a
//     parent) are appended to the tree's tail so nothing is dropped silently.
//   • Tasks with NO dependency edge at all are pulled out under an UNLINKED
//     header as flat cards.
//   • The critical path (criticalPathIds, server-derived longest chain) recolors
//     its connectors to $primary, keyed by the CRITICAL PATH legend.
//
// TaskCard computes its OWN window-state from `now` + `tz` (browser-side) so the
// board stays live; this view only feeds it the VM + shared now/tz + an onCycle
// bound to the task id, and decides each node's tree position (depth + critical).

const INDENT_PX = 36;

/** One flattened tree row to render: a task + its depth + critical-path flag. */
interface TreeRow {
  task: TaskVM;
  depth: number;
  /** This node is on the critical path → its connector is recolored primary. */
  critical: boolean;
}

/**
 * Flatten the dependency forest into an ordered, cycle-safe list of TreeRows.
 * Roots first (each followed by its DFS subtree), then any nodes unreachable
 * from a root (members of pure cycles) appended at depth 0 so nothing is lost.
 */
function buildTreeRows(
  tasks: TaskVM[],
  deps: DependencyEdgeVM[],
  criticalSet: Set<string>,
): { rows: TreeRow[]; unlinked: TaskVM[] } {
  const taskById = new Map<string, TaskVM>();
  for (const t of tasks) taskById.set(t.id, t);

  // Inverse adjacency: prerequisite (dependsOnId) → its dependents (taskId).
  const childrenOf = new Map<string, string[]>();
  // Tasks that depend on something (appear as a dependent `taskId`).
  const hasParent = new Set<string>();
  // Any id touched by an edge on either side (used to find UNLINKED tasks).
  const hasEdge = new Set<string>();

  for (const { taskId, dependsOnId } of deps) {
    // Ignore self-deps and edges that don't reference a real, rendered task on
    // both ends — a dangling edge must not invent a phantom parent/child.
    if (taskId === dependsOnId) continue;
    if (!taskById.has(taskId) || !taskById.has(dependsOnId)) continue;
    const list = childrenOf.get(dependsOnId);
    if (list) {
      if (!list.includes(taskId)) list.push(taskId);
    } else {
      childrenOf.set(dependsOnId, [taskId]);
    }
    hasParent.add(taskId);
    hasEdge.add(taskId);
    hasEdge.add(dependsOnId);
  }

  // UNLINKED = tasks with no edge at all (neither parent nor child).
  const unlinked = tasks.filter((t) => !hasEdge.has(t.id));

  const rows: TreeRow[] = [];
  // Global visited set → each node renders EXACTLY once (cycle-safe + dedupes
  // shared/diamond dependencies). `onPath` catches back-edges within a branch.
  const rendered = new Set<string>();

  const visit = (id: string, depth: number, onPath: Set<string>): void => {
    const task = taskById.get(id);
    if (!task) return; // dangling id — skip
    if (rendered.has(id)) return; // already placed elsewhere (cross/back edge)

    rendered.add(id);
    onPath.add(id);
    rows.push({ task, depth, critical: criticalSet.has(id) });

    // Children in the task's own array order (stable, mirrors `tasks` ordering).
    const childIds = childrenOf.get(id) ?? [];
    for (const childId of childIds) {
      if (onPath.has(childId)) continue; // back-edge — do not recurse (rendered once via its own root, or appended below)
      visit(childId, depth + 1, onPath);
    }

    onPath.delete(id);
  };

  // 1) Roots = linked tasks that depend on nothing. Walk in `tasks` order.
  for (const t of tasks) {
    if (hasEdge.has(t.id) && !hasParent.has(t.id)) {
      visit(t.id, 0, new Set<string>());
    }
  }

  // 2) Anything still unrendered but edged is unreachable from a root (a pure
  //    cycle, e.g. A→B→A). Emit each remaining member once at depth 0 so the
  //    cycle is visible and nothing is silently dropped (its dependents recurse
  //    as far as the visited-set allows).
  for (const t of tasks) {
    if (hasEdge.has(t.id) && !rendered.has(t.id)) {
      visit(t.id, 0, new Set<string>());
    }
  }

  return { rows, unlinked };
}

export function DependenciesView({
  tasks,
  deps,
  criticalPathIds,
  tz,
  now,
  onCycle,
}: ViewProps) {
  const criticalSet = new Set(criticalPathIds);
  const { rows, unlinked } = buildTreeRows(tasks, deps, criticalSet);

  return (
    <div className="flex flex-col gap-3.5 px-8 py-5">
      {/* Content head — DEPENDENCY TREE eyebrow + CRITICAL PATH legend key. */}
      <div className="flex items-center justify-between">
        <Eyebrow as="h2" tone="muted" weight={600} tracking={1.5}>
          Dependency Tree
        </Eyebrow>
        {criticalSet.size > 0 ? (
          <div className="flex items-center gap-2">
            <CornerDownRight
              size={14}
              aria-hidden="true"
              className="shrink-0 text-primary"
            />
            <span className="font-mono text-[10px] uppercase leading-none tracking-[1px] text-primary">
              Critical Path
            </span>
          </div>
        ) : null}
      </div>

      {/* The indented tree — one DependencyTreeNode (inlined) per flattened row. */}
      {rows.length > 0 ? (
        <div role="tree" aria-label="Dependency tree" className="flex flex-col gap-2.5">
          {rows.map(({ task, depth, critical }) => (
            <div
              key={task.id}
              role="treeitem"
              aria-level={depth + 1}
              className="flex w-full items-center"
            >
              {/* depth × 36px lead block: (depth-1) spacers + 1 connector. */}
              {depth > 0 ? (
                <>
                  {Array.from({ length: depth - 1 }, (_, i) => (
                    <span
                      key={i}
                      aria-hidden="true"
                      style={{ width: INDENT_PX }}
                      className="h-px shrink-0"
                    />
                  ))}
                  <DependencyConnector variant={critical ? "critical" : "default"} />
                </>
              ) : null}
              <TaskCard
                task={task}
                tz={tz}
                now={now}
                criticalPath={critical}
                onCycle={(next) => onCycle(task.id, next)}
              />
            </div>
          ))}
        </div>
      ) : null}

      {/* UNLINKED group — flat cards for tasks with no dependency edges. */}
      {unlinked.length > 0 ? (
        <>
          <UnlinkedGroupHeader count={unlinked.length} />
          <div className="flex flex-col gap-2.5">
            {unlinked.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                tz={tz}
                now={now}
                criticalPath={criticalSet.has(task.id)}
                onCycle={(next) => onCycle(task.id, next)}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
