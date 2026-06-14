"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { z } from "zod";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { ScopeChip } from "@opsboard/ui/components/scope-chip";
import { ResearchJobPanel } from "@opsboard/ui/components/research-job-panel";
import { ComeBackLaterBanner } from "@opsboard/ui/components/come-back-later-banner";
import { MinimizedJobPill } from "@opsboard/ui/components/minimized-job-pill";
import { ErrorStateCard } from "@opsboard/ui/components/error-state-card";
import { ResearchResult, ResearchStep, researchNoteCount } from "@opsboard/types";
import type { ResearchJobView } from "@/lib/research-types";

// /research/[jobId] RUNNING surface (client). Seeded with the server-loaded job,
// it polls GET /api/research/[jobId] every couple of seconds while the job runs
// (the durable Inngest runner advances the row out-of-band), streaming the live
// step log into the ResearchJobPanel. Polling stops the moment the job reaches a
// terminal state (complete / error). MINIMIZE collapses to a docked pill; COME
// BACK LATER returns to the board (the job keeps running — reopen to see it).
//
// The full Result & Notes review (AINotesBlock + KEEP NOTES write) is the next
// milestone (M5); here a completed job shows a compact summary + note count.

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

export interface ResearchRunningProps {
  initialJob: ResearchJobView;
  taskName: string;
  missionName: string;
}

export function ResearchRunning({
  initialJob,
  taskName,
  missionName,
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
          <div className="flex flex-col gap-4">
            <ErrorStateCard
              header="RESEARCH FAILED"
              body={
                job.errorMessage ??
                "Something went wrong while researching. Try cueing it again."
              }
              actionLabel="BACK TO BOARD"
              onAction={() => router.push("/")}
            />
          </div>
        ) : job.state === "complete" && job.result ? (
          <CompleteState
            result={job.result}
            taskName={taskName}
            elapsedLabel={elapsedLabel}
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
 * The compact M4 completion state. Full notes review + KEEP NOTES persistence is
 * M5; here we confirm the job finished and preview the summary + note count.
 */
function CompleteState({
  result,
  taskName,
  elapsedLabel,
}: {
  result: ResearchResult;
  taskName: string;
  elapsedLabel: string;
}) {
  const count = researchNoteCount(result);
  return (
    <div className="flex flex-col gap-3 border-l-[3px] border-success bg-card p-5">
      <Eyebrow tone="foreground" weight={700} tracking={2}>
        ✓ Research complete · {elapsedLabel}
      </Eyebrow>
      <p className="text-[14px] leading-relaxed text-foreground">
        {result.summary}
      </p>
      <p className="text-[13px] text-muted-foreground">
        {count} {count === 1 ? "note" : "notes"} ready for “{taskName}”. Review
        &amp; keep is coming next.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline" size="sm">
          <Link href="/">Back to board</Link>
        </Button>
      </div>
    </div>
  );
}
