"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { windowState, windowStateDetail } from "@opsboard/core";
import { useNowTick } from "@opsboard/ui/hooks/use-now-tick";
import { useMediaQuery } from "@opsboard/ui/hooks/use-media-query";
import { AppHeader } from "@opsboard/ui/components/app-header";
import { Sidebar } from "@opsboard/ui/components/sidebar";
import { NavCard, type NavCardChip } from "@opsboard/ui/components/nav-card";
import { MissionDetailHeader } from "@opsboard/ui/components/mission-detail-header";
import { SyncStatus } from "@opsboard/ui/components/sync-status";
import { ViewTabs, type ViewTabValue } from "@opsboard/ui/components/view-tabs";
import { EmptyState } from "@opsboard/ui/components/empty-state";
import { cn } from "@opsboard/ui/lib/utils";
import type { TaskStatus } from "@opsboard/types";
import type {
  DashboardData,
  MissionTaskWindow,
  ViewProps,
} from "@/lib/dashboard-types";
import { updateTaskStatusAction } from "@/app/actions";
import { CategoryView } from "@/components/views/category-view";
import { TimelineView } from "@/components/views/timeline-view";
import { DependenciesView } from "@/components/views/dependencies-view";
import { VoiceController } from "@/components/voice/voice-controller";
import { SettingsLink } from "@/components/settings-link";
import { ResearchLink } from "@/components/research-link";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  MissionCreateLauncher,
  MissionEditLauncher,
  TaskCreateLauncher,
} from "@/components/board/board-actions";

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
      if (windowState(now, toWindowInput(task), tz) === "closing") {
        closing += 1;
      }
    }
    return { done, blocked, closing, total: data.tasks.length };
  }, [data.tasks, now, tz]);

  // Operator/date block for the header (SOLO OPERATOR · live dot · DD MON YYYY)
  // and the mission target line (`TARGET: 27 APR 2026 · 328 DAYS OUT`). Both are
  // derived from the live `now` so the date + countdown stay current as it ticks.
  const operatorDate = useMemo(() => formatHumanDate(now), [now]);
  const targetLabel = useMemo(
    () => formatIsoToHuman(data.mission.targetDate),
    [data.mission.targetDate],
  );
  const targetDaysOut = useMemo(() => {
    // tz-AWARE days-out: reuse core's windowStateDetail (whole days to the
    // target's LOCAL end-of-day in `tz`) rather than the UTC chip helper, so the
    // header countdown doesn't skew a day near midnight UTC.
    const days = windowStateDetail(
      now,
      { too_late_by: data.mission.targetDate },
      tz,
    ).daysUntilClose;
    return days != null && days >= 0 ? days : null;
  }, [data.mission.targetDate, now, tz]);

  const viewProps: ViewProps = {
    tasks: data.tasks,
    categories: data.categories,
    deps: data.deps,
    criticalPathIds: data.criticalPathIds,
    tz,
    now,
    onCycle,
  };

  // A mission with zero tasks → the voice-first no-tasks EmptyState (states.md
  // §3 copy variant: NO TASKS YET / "add a task"), rendered uniformly for all
  // three views rather than each view showing a bare blank panel.
  const activeView =
    data.tasks.length === 0 ? (
      <div className="flex flex-1 items-center justify-center p-6">
        <div className="flex w-full max-w-md flex-col items-center gap-5">
          <EmptyState
            message="NO TASKS YET"
            hint='Add a task below, or say "add a task".'
            hintStyle="tokens"
            className="w-full"
          />
          <TaskCreateLauncher
            missionId={data.activeMissionId}
            categories={data.categories}
          />
        </div>
      </div>
    ) : view === "category" ? (
      <CategoryView {...viewProps} />
    ) : view === "timeline" ? (
      <TimelineView {...viewProps} />
    ) : (
      <DependenciesView {...viewProps} />
    );

  // Mission rail: each NavCard is wrapped in a plain anchor (?mission=ID) so the
  // ui kit stays framework-agnostic (the app supplies the href). EVERY card —
  // active or not — carries its own {done}/{total} count + nearest-cliff window
  // chip, derived from that mission's server-supplied task-window inputs.
  const missionList = data.missions.map((m) => {
    const isActive = m.id === data.activeMissionId;
    const done = m.taskWindows.reduce(
      (n, w) => (w.status === "done" ? n + 1 : n),
      0,
    );
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
          done={done}
          total={m.taskWindows.length}
          chip={deriveMissionChip(m.taskWindows, now, tz)}
          tabIndex={-1}
        />
      </a>
    );
  });

  const mainColumn = (
    <div className="flex min-w-0 flex-1 flex-col">
      <MissionDetailHeader
        title={data.mission.name}
        targetDate={targetLabel}
        daysOut={targetDaysOut}
        stats={stats}
        progress={{
          done: stats.done,
          closing: stats.closing,
          blocked: stats.blocked,
          total: stats.total,
        }}
      />
      {/* Non-voice board actions — edit the mission, add a task by form. */}
      <div className="flex flex-wrap items-center gap-2 px-8 pt-4">
        <MissionEditLauncher mission={data.mission} />
        <TaskCreateLauncher
          missionId={data.activeMissionId}
          categories={data.categories}
        />
      </div>
      <ViewTabs value={view} onValueChange={setView} />
      <div
        role="tabpanel"
        id={`view-panel-${view}`}
        aria-labelledby={`view-tab-${view}`}
        className="flex min-w-0 flex-1 flex-col overflow-y-auto"
      >
        {/* Keyed by mission + view so switching EITHER remounts the boundary,
            clearing a stuck error from the previous mission/view. A view crash
            shows the RETRY fallback while the header/sidebar/tabs stay mounted. */}
        <ErrorBoundary key={`${data.activeMissionId}:${view}`}>
          {activeView}
        </ErrorBoundary>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <>
            <SyncStatus leadingLabel="SOLO OPERATOR" dateLabel={operatorDate} />
            <ResearchLink />
            <SettingsLink />
          </>
        }
      />
      <div
        className={cn(
          "flex min-h-0 flex-1",
          isDesktop ? "flex-row" : "flex-col",
        )}
      >
        {isDesktop ? (
          <Sidebar title="MISSIONS" count={data.missions.length}>
            <div className="mb-3">
              <MissionCreateLauncher className="w-full justify-center" />
            </div>
            {missionList}
          </Sidebar>
        ) : (
          // Mobile: the mission rail collapses to a horizontal strip above the
          // main column (single-column, thumb-reachable).
          <nav className="flex items-center gap-2 overflow-x-auto border-b border-border bg-muted px-4 py-3">
            <MissionCreateLauncher />
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

/** The structural subset windowState() consumes (shared by TaskVM + MissionTaskWindow). */
function toWindowInput(task: MissionTaskWindow) {
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
 * the design calls for on the sidebar mission card. Empty missions get no chip.
 */
function deriveMissionChip(
  tasks: MissionTaskWindow[],
  now: number,
  tz: string,
): NavCardChip | undefined {
  if (tasks.length === 0) return undefined;

  const allDone = tasks.every((t) => t.status === "done");
  if (allDone) return { label: "COMPLETE", tone: "success" };

  let soonestDays: number | null = null;
  for (const task of tasks) {
    if (task.status === "done") continue;
    // tz-AWARE: windowStateDetail gives both the state AND the local days-to-cliff
    // in one pass, so the chip's countdown matches the per-task pill's tz boundary.
    const detail = windowStateDetail(now, toWindowInput(task), tz);
    if (detail.state !== "closing") continue;
    const days = detail.daysUntilClose;
    if (days != null && (soonestDays == null || days < soonestDays)) {
      soonestDays = days;
    }
  }
  if (soonestDays != null) {
    return { label: `T-${Math.max(soonestDays, 0)}d`, tone: "warning" };
  }
  return undefined;
}

const MONTHS_UPPER = [
  "JAN",
  "FEB",
  "MAR",
  "APR",
  "MAY",
  "JUN",
  "JUL",
  "AUG",
  "SEP",
  "OCT",
  "NOV",
  "DEC",
] as const;

/** Format an epoch (ms) as the operator-block date `DD MON YYYY` in local time. */
function formatHumanDate(now: number): string {
  const d = new Date(now);
  const day = String(d.getDate()).padStart(2, "0");
  return `${day} ${MONTHS_UPPER[d.getMonth()]} ${d.getFullYear()}`;
}

/** Format an ISO `YYYY-MM-DD` to the uppercase human `DD MON YYYY`; null/garbage → as-is/null. */
function formatIsoToHuman(iso: string | null): string | null {
  if (iso == null) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso.trim());
  if (!m) return iso;
  return `${m[3]} ${MONTHS_UPPER[Number(m[2]) - 1]} ${m[1]}`;
}
