import { CategoryGroupHeader } from "@opsboard/ui/components/category-group-header";
import { TaskCard } from "@opsboard/ui/components/task-card";
import type { ViewProps, TaskVM, CategoryVM } from "@/lib/dashboard-types";

// The DEFAULT board view (board D3JA0i). Groups tasks by category in sort_order,
// skips empty groups, and renders a CategoryGroupHeader + a TaskCard per task.
// Gap hierarchy (load-bearing, per category-board.md §2.4): 26px between groups
// → 12px header→list within a group → 10px between cards.
//
// TaskCard computes its OWN window-state from `now` + `tz` (browser-side) so the
// board stays live; this view just feeds it the VM + the shared now/tz + an
// onCycle bound to the task id. criticalPathIds is forwarded so a card can flag
// itself on the critical path (advisory only on the Category board).

interface CategoryGroup {
  category: CategoryVM;
  tasks: TaskVM[];
  done: number;
}

export function CategoryView({
  tasks,
  categories,
  criticalPathIds,
  tz,
  now,
  onCycle,
}: ViewProps) {
  const criticalSet = new Set(criticalPathIds);

  // Bucket tasks by slug once.
  const tasksBySlug = new Map<string, TaskVM[]>();
  for (const task of tasks) {
    if (task.categorySlug == null) continue;
    const list = tasksBySlug.get(task.categorySlug);
    if (list) list.push(task);
    else tasksBySlug.set(task.categorySlug, [task]);
  }

  // Build groups in category sort_order; skip empty groups (spec §6: groups with
  // zero tasks are omitted). `categories` arrives pre-sorted by sortOrder, but we
  // sort defensively so ordering never depends on upstream stability.
  const groups: CategoryGroup[] = [...categories]
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((category) => {
      const groupTasks = tasksBySlug.get(category.slug) ?? [];
      return {
        category,
        tasks: groupTasks,
        done: groupTasks.filter((t) => t.status === "done").length,
      };
    })
    .filter((group) => group.tasks.length > 0);

  return (
    <div className="flex flex-col gap-[26px] px-8 py-5">
      {groups.map(({ category, tasks: groupTasks, done }) => (
        <section key={category.slug} className="flex flex-col gap-3">
          <CategoryGroupHeader
            color={category.color}
            label={category.name}
            doneCount={done}
            totalCount={groupTasks.length}
          />
          <div className="flex flex-col gap-2.5">
            {groupTasks.map((task) => (
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
        </section>
      ))}
    </div>
  );
}
