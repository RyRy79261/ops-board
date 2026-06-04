"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { windowState } from "@opsboard/core";
import { useNowTick } from "@opsboard/ui/hooks/use-now-tick";
import { useMediaQuery } from "@opsboard/ui/hooks/use-media-query";
import { AppHeader } from "@opsboard/ui/components/app-header";
import { Sidebar } from "@opsboard/ui/components/sidebar";
import { NavCard, type NavCardChip } from "@opsboard/ui/components/nav-card";
import { MissionDetailHeader } from "@opsboard/ui/components/mission-detail-header";
import {
  ViewTabs,
  type ViewTabValue,
} from "@opsboard/ui/components/view-tabs";
import { cn } from "@opsboard/ui/lib/utils";
import type { TaskStatus } from "@opsboard/types";
import type { DashboardData, TaskVM, ViewProps } from "@/lib/dashboard-types";
import { updateTaskStatusAction } from "@/app/actions";
import { CategoryView } from "@/components/views/category-view";
import { TimelineView } from "@/components/views/timeline-view";
import { DependenciesView } from "@/components/views/dependencies-view";
import { VoiceController } from "@/components/voice/voice-controller";

// The client shell: AppHeader + a responsive layout (mobile single-column ↔
// desktop 3-pane). Holds the active-view state (ViewTabs), provides each view a
// FRESH `now` (re-read on every 60s useNowTick) + the browser IANA `tz` so
// TaskCards recompute window-state live, and an onCycle that runs the
// status-cycle Server Action inside a transition. A light liveness island calls
// router.refresh() every 45s so a status change made elsewhere (voice/MCP)
// shows up without a manual reload.

// Desktop breakpoint: at/above this, render the 3-pane (sidebar + main); below
// it, single column (mobile-first).
const DESKTOP_QUERY = "(min-width: 768px)";
const REFRESH_MS = 45_000;

export function DashboardShell({ data }: { data: DashboardData }) {
  const router = useRouter();
  const [view, setView] = useState<ViewTabValue>("category");
  const [, startTransition] = useTransition();

  // Live clock: useNowTick increments every 60s; we re-read Date.now() on each
  // tick so window-state (computed in TaskCards from this `now`) stays current.
  const tick = useNowTick(60_000);
  const now = useMemo(() => Date.now(), [tick]);

  // Browser IANA timezone — fed into the pure windowState derivation. Resolved
  // once (it doesn't change within a session).
  const tz = useMemo(
    () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    [],
  );

  const isDesktop = useMediaQuery(DESKTOP_QUERY);

  // Liveness island: gently re-pull the server board every 45s so out-of-band
  // mutations (voice / MCP) surface. router.refresh() re-runs the RSC; React
  // reconciles without losing the client view/optimistic state.
  useEffect(() => {
    const id = setInterval(() => router.refresh(), REFRESH_MS);
    return () => clearInterval(id);
  }, [router]);

  // The status-cycle handler every view receives. Persists `next` via the
  // Server Action inside a transition (the TaskCard owns the optimistic value;
  // the action + revalidate reconcile the source of truth). On failure we just
  // refresh so the card snaps back to the server's status.
  const onCycle = (taskId: string, next: TaskStatus) => {
    startTransition(async () => {
      const result = await updateTaskStatusAction(taskId, next);
      if (!result.ok) router.refresh();
    });
  };

  // ── Derived mission stats for the MissionDetailHeader. `closing` is
  // tz-DEPENDENT (it needs windowState(now, task, tz)) so it is computed HERE,
  // client-side, alongside done/blocked/total. Recomputes as `now` ticks.
  const stats = useMemo(() => {
    let done = 0;
    let blocked = 0;
    let closing = 0;
    for (const task of data.tasks) {
      if (task.status === "done") done += 1;
      if (task.blocked) blocked += 1;
      if (windowState(now, taskToWindowInput(task), tz) === "closing") {
        closing += 1;
      }
    }
    return { done, blocked, closing, total: data.tasks.length };
  }, [data.tasks, now, tz]);

  // The active mission's window-summary chip for its NavCard: the nearest cliff
  // among non-done tasks. Closing → warning T-Nd; all done → success; else muted.
  const activeChip = useMemo(
    () => deriveMissionChip(data.tasks, now, tz),
    [data.tasks, now, tz],
  );

  const viewProps: ViewProps = {
    tasks: data.tasks,
    categories: data.categories,
    deps: data.deps,
    criticalPathIds: data.criticalPathIds,
    tz,
    now,
    onCycle,
  };

  const activeView =
    view === "category" ? (
      <CategoryView {...viewProps} />
    ) : view === "timeline" ? (
      <TimelineView {...viewProps} />
    ) : (
      <DependenciesView {...viewProps} />
    );

  // Mission rail: each NavCard is wrapped in a plain anchor (?mission=ID) so the
  // ui kit stays framework-agnostic (the app supplies the href). The active
  // mission gets the count + window chip; others render a label-only card.
  const missionList = data.missions.map((m) => {
    const isActive = m.id === data.activeMissionId;
    return (
      <a
        key={m.id}
        href={`?mission=${encodeURIComponent(m.id)}`}
        className="block outline-none"
        aria-current={isActive ? "page" : undefined}
      >
        <NavCard
          name={m.name}
          active={isActive}
          done={isActive ? stats.done : 0}
          total={isActive ? stats.total : 0}
          chip={isActive ? activeChip : undefined}
          tabIndex={-1}
        />
      </a>
    );
  });

  const mainColumn = (
    <div className="flex min-w-0 flex-1 flex-col">
      <MissionDetailHeader
        title={data.mission.name}
        targetDate={data.mission.targetDate}
        stats={stats}
        progress={{
          done: stats.done,
          closing: stats.closing,
          blocked: stats.blocked,
          total: stats.total,
        }}
      />
      <ViewTabs value={view} onValueChange={setView} />
      <div
        role="tabpanel"
        id={`view-panel-${view}`}
        aria-labelledby={`view-tab-${view}`}
        className="min-w-0 flex-1 overflow-y-auto"
      >
        {activeView}
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader />
      <div
        className={cn(
          "flex min-h-0 flex-1",
          isDesktop ? "flex-row" : "flex-col",
        )}
      >
        {isDesktop ? (
          <Sidebar title="MISSIONS">{missionList}</Sidebar>
        ) : (
          // Mobile: the mission rail collapses to a horizontal strip above the
          // main column (single-column, thumb-reachable).
          <nav className="flex gap-2 overflow-x-auto border-b border-border bg-muted px-4 py-3">
            {missionList}
          </nav>
        )}
        {mainColumn}
      </div>
      {/* The voice command flow — the fixed mic FAB + capture panel + the Toaster
          feedback surface. The board mutates only via this pipeline (voice) or a
          StatusCycleButton tap; the controller calls router.refresh() after any
          successful mutation so the board reflects it. */}
      <VoiceController />
    </div>
  );
}

/** Map a TaskVM to the structural subset windowState() consumes. */
function taskToWindowInput(task: TaskVM) {
  return {
    too_late_by: task.too_late_by,
    not_before: task.not_before,
    blocked: task.blocked,
  };
}

/**
 * The mission's NavCard window-summary chip. Walks the non-done tasks: if any is
 * `closing`, show the soonest as a warning `T-Nd` chip; if every task is done,
 * a success chip; otherwise no chip (calm). Mirrors the nearest-cliff aggregate
 * the design calls for on the sidebar mission card.
 */
function deriveMissionChip(
  tasks: TaskVM[],
  now: number,
  tz: string,
): NavCardChip | undefined {
  if (tasks.length === 0) return undefined;

  const allDone = tasks.every((t) => t.status === "done");
  if (allDone) return { label: "COMPLETE", tone: "success" };

  let soonestDays: number | null = null;
  for (const task of tasks) {
    if (task.status === "done") continue;
    if (windowState(now, taskToWindowInput(task), tz) !== "closing") continue;
    const days = daysUntil(task.too_late_by, now);
    if (days != null && (soonestDays == null || days < soonestDays)) {
      soonestDays = days;
    }
  }
  if (soonestDays != null) {
    return { label: `T-${Math.max(soonestDays, 0)}d`, tone: "warning" };
  }
  return undefined;
}

/** Whole days from `now` to the end-of-the cliff date (UTC-day floor; coarse — the
 *  chip is a summary cue, the per-task pill carries the precise countdown). */
function daysUntil(iso: string | null, now: number): number | null {
  if (iso == null) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!match) return null;
  const cliff = Date.UTC(
    Number(match[1]),
    Number(match[2]) - 1,
    Number(match[3]),
    23,
    59,
    59,
    999,
  );
  return Math.floor((cliff - now) / 86_400_000);
}
