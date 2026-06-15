"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, CircleAlert } from "lucide-react";
import { z } from "zod";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { ScopeChip } from "@opsboard/ui/components/scope-chip";
import { ResearchJobPanel } from "@opsboard/ui/components/research-job-panel";
import { ComeBackLaterBanner } from "@opsboard/ui/components/come-back-later-banner";
import { MinimizedJobPill } from "@opsboard/ui/components/minimized-job-pill";
import { ErrorStateCard } from "@opsboard/ui/components/error-state-card";
import { AINotesBlock } from "@opsboard/ui/components/ai-notes-block";
import { ResearchResult, ResearchStep, researchNoteCount } from "@opsboard/types";
import type { ResearchJobView } from "@/lib/research-types";

// /research/[jobId] RUNNING + RESULT surface (client). Seeded with the
// server-loaded job, it polls GET /api/research/[jobId] every couple of seconds
// while the job runs (the durable Inngest runner advances the row out-of-band),
// streaming the live step log into the ResearchJobPanel. Polling stops the moment
// the job reaches a terminal state. MINIMIZE collapses to a docked pill; COME
// BACK LATER returns to the board (the job keeps running — reopen to see it).
//
// On COMPLETE it shows the Result & Notes review (AINotesBlock) — the user
// explicitly KEEPs (→ POST /api/research/[jobId]/keep-notes, the single write) or
// DISMISSes. Already-kept jobs (re-opened) show the kept confirmation instead.

const POLL_MS = 2000;

// Validate the poll envelope at the client boundary (don't `as`-assert an
// untrusted response). `steps` + `result` reuse the @opsboard/types schemas, so
// they stay in lockstep with the source of truth (and citation→source integrity
// is checked too).
const JobViewSchema = z.object({
  id: z.string(),
  state: z.enum(["running", "complete", "error"]),
  query: z.string(),
  steps: z.array(ResearchStep),
  result: ResearchResult.nullable(),
  errorMessage: z.string().nullable(),
  taskId: z.string(),
  createdAt: z.string(),
  completedAt: z.string().nullable(),
});

function formatElapsed(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, "0");
  const ss = String(total % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

/** AINotesBlock attribution timestamp, e.g. "2026-06-03 14:22" (local time). */
function formatTimestamp(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

export interface ResearchRunningProps {
  initialJob: ResearchJobView;
  taskName: string;
  missionName: string;
  /** True when this job's notes were already kept (re-opened) — show the kept state. */
  alreadyKept: boolean;
}

export function ResearchRunning({
  initialJob,
  taskName,
  missionName,
  alreadyKept,
}: ResearchRunningProps) {
  const router = useRouter();
  const [job, setJob] = React.useState<ResearchJobView>(initialJob);
  const [minimized, setMinimized] = React.useState(false);
  const [now, setNow] = React.useState(() => Date.now());

  const isRunning = job.state === "running";

  // Poll the owner-scoped job endpoint while the job runs; stop on terminal.
  React.useEffect(() => {
    if (!isRunning) return;
    let cancelled = false;
    const id = setInterval(() => {
      void (async () => {
        try {
          const res = await fetch(`/api/research/${job.id}`, {
            cache: "no-store",
          });
          if (!res.ok) return; // transient — keep the last good state, retry next tick
          const parsed = JobViewSchema.safeParse(await res.json());
          if (!cancelled && parsed.success) setJob(parsed.data);
        } catch {
          // network blip — ignore and let the next tick retry
        }
      })();
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [isRunning, job.id]);

  // Tick the elapsed clock once a second while running; freeze when terminal.
  React.useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  const startedAt = Date.parse(job.createdAt);
  const endedAt = job.completedAt ? Date.parse(job.completedAt) : now;
  const elapsedLabel = formatElapsed(endedAt - startedAt);

  // Step counter for the panel: the active step (1-based), else how many are done.
  const activeIdx = job.steps.findIndex((s) => s.state === "active");
  const doneCount = job.steps.filter((s) => s.state === "done").length;
  const currentStep = activeIdx >= 0 ? activeIdx + 1 : doneCount;
  const activeSource =
    activeIdx >= 0 ? job.steps[activeIdx]?.source : undefined;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft aria-hidden="true" /> Board
            </Link>
          </Button>
        }
      />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-5 p-6">
        <header className="flex flex-col gap-2">
          <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
            Task Agent
          </Eyebrow>
          <p className="text-label text-muted-foreground">
            {`“${job.query}”`}
          </p>
        </header>

        <ScopeChip variant="locked" mission={missionName} />

        {job.state === "error" ? (
          <ErrorStateCard
            tone="destructive"
            icon={CircleAlert}
            header="RESEARCH FAILED"
            body={
              job.errorMessage ??
              "Something went wrong while researching. Try cueing it again."
            }
            actions={[
              {
                label: "Back to board",
                variant: "primary",
                onClick: () => router.push("/"),
              },
            ]}
          />
        ) : job.state === "complete" && job.result ? (
          <CompleteState
            result={job.result}
            taskName={taskName}
            timestamp={formatTimestamp(job.completedAt)}
            jobId={job.id}
            alreadyKept={alreadyKept}
          />
        ) : minimized ? (
          // Collapsed: the work continues; a docked pill keeps it glanceable.
          <>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Researching “{taskName}” in the background — expand the pill to
              watch the step log, or head back to the board.
            </p>
            <MinimizedJobPill
              variant="docked"
              taskName={taskName}
              elapsedLabel={elapsedLabel}
              onExpand={() => setMinimized(false)}
              className="fixed bottom-4 right-4 z-50"
            />
          </>
        ) : (
          // Running, expanded: the live panel + come-back-later reassurance.
          <>
            <ResearchJobPanel
              variant="desktop"
              taskName={taskName}
              elapsedLabel={elapsedLabel}
              steps={job.steps}
              streaming
              stepNote={activeSource}
              {...(job.steps.length > 0
                ? { currentStep, totalSteps: job.steps.length }
                : {})}
            />
            <ComeBackLaterBanner
              variant="primary"
              onMinimize={() => setMinimized(true)}
              onComeBackLater={() => router.push("/")}
            />
          </>
        )}
      </main>
    </div>
  );
}

/**
 * The Result & Notes review. A completed job's findings are shown for explicit
 * review — AI output is NEVER auto-committed. KEEP NOTES is the single write
 * (POST /api/research/[jobId]/keep-notes, which persists the job's OWN stored
 * result); DISMISS discards (no write). Once kept (or re-opened already-kept),
 * the proposal is replaced by the success confirmation, per the spec.
 */
function CompleteState({
  result,
  taskName,
  timestamp,
  jobId,
  alreadyKept,
}: {
  result: ResearchResult;
  taskName: string;
  timestamp: string;
  jobId: string;
  alreadyKept: boolean;
}) {
  const router = useRouter();
  const [kept, setKept] = React.useState(alreadyKept);
  const [keeping, setKeeping] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const count = researchNoteCount(result);

  const onKeep = React.useCallback(async () => {
    if (keeping) return;
    setKeeping(true);
    setError(null);
    try {
      const res = await fetch(`/api/research/${jobId}/keep-notes`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as {
          error?: unknown;
        } | null;
        const serverMsg =
          data && typeof data.error === "string" ? data.error : "";
        // Friendly copy for the system statuses; trust the route's own message
        // for the user-facing ones (e.g. 409 "isn't ready to keep yet").
        const friendly =
          res.status === 401
            ? "Your session expired — sign in and try again."
            : res.status === 429
              ? "Too many attempts — wait a moment and try again."
              : serverMsg || "Couldn't keep those notes — try again.";
        setError(friendly);
        setKeeping(false);
        return;
      }
      setKept(true); // success: replace the proposal with the confirmation
    } catch {
      setError("Network error — check your connection and try again.");
      setKeeping(false);
    }
  }, [jobId, keeping]);

  const onViewSources = React.useCallback(() => {
    for (const s of result.sources) {
      if (s.url) window.open(s.url, "_blank", "noopener,noreferrer");
    }
  }, [result.sources]);

  if (kept) {
    // Re-opened an already-kept job (e.g. via the board "✦ N" link) → render the
    // kept notes READ-ONLY (AINotesBlock with no keep/dismiss). A FRESH keep this
    // session falls through to the success confirmation (spec §3 — the toast
    // replaces the proposal; the user just reviewed the full notes).
    if (alreadyKept) {
      return (
        <div className="flex flex-col gap-3">
          <span className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[1px] text-success">
            <Check className="size-3.5" aria-hidden="true" /> Kept · {count}{" "}
            {count === 1 ? "note" : "notes"} on “{taskName}”
          </span>
          <AINotesBlock
            variant="desktop"
            isNew={false}
            noteCount={count}
            timestamp={timestamp}
            summary={result.summary}
            steps={result.steps}
            sources={result.sources}
          />
          <div className="flex gap-3">
            <Button asChild variant="outline" size="sm">
              <Link href="/">Back to board</Link>
            </Button>
          </div>
        </div>
      );
    }
    return (
      <div
        role="status"
        className="flex flex-col gap-3 border-t-2 border-success bg-card p-5"
      >
        <span className="flex items-center gap-2 font-mono text-[12px] font-bold uppercase tracking-[1px] text-success">
          <Check className="size-3.5" aria-hidden="true" /> Added {count}{" "}
          {count === 1 ? "note" : "notes"}
        </span>
        <p className="text-[13px] text-muted-foreground">
          {`Notes appended to “${taskName}”.`}
        </p>
        <p className="text-[14px] leading-relaxed text-foreground">
          {result.summary}
        </p>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/">Back to board</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <AINotesBlock
        variant="desktop"
        isNew
        noteCount={count}
        timestamp={timestamp}
        summary={result.summary}
        steps={result.steps}
        sources={result.sources}
        onKeep={onKeep}
        onDismiss={() => router.push("/")}
        onViewSources={onViewSources}
      />
      {keeping ? (
        <p role="status" className="text-[13px] text-muted-foreground">
          Saving notes…
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-[13px] text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}
