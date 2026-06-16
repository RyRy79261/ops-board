import * as React from "react";
import { CircleCheck, LoaderCircle } from "lucide-react";

import { cn } from "../lib/utils";
import { ProgressBar } from "./progress-bar";
import { ResearchStepRow } from "./research-step-row";

/**
 * ResearchJobPanel — the async RUNNING-job surface on the AI Research screen
 * (`03-surfaces/ai-research.md` §2.2 (a)+(b) desktop `k8VQ7`/`Q0zpVY`, §3.2 (b)
 * mobile `xOvqP`). It COMPOSES the job card + the LIVE STEP LOG section into one
 * controlled leaf.
 *
 * Desktop (`variant="desktop"`, AUTHORITATIVE): a `$card` card with a 2px
 * `$primary` top accent → a header row (arc spinner + `RESEARCHING…` mono + an
 * `ELAPSED` / 30px mono timer block), the DM Sans task name + scope note, the
 * INDETERMINATE `ProgressBar` sweep, and a meta line (`Step X of Y · note` +
 * `NO FIXED ETA`). Below it a SEPARATE LIVE STEP LOG card: a `$muted` LogHead
 * (`LIVE STEP LOG` + a `STREAMING` `$success` dot) over `ResearchStepRow` lines.
 *
 * Mobile (`variant="mobile"`): a single `$card` card (NO top accent), the timer
 * inlined beside `RESEARCHING…`, then the indeterminate bar, then an inline log
 * whose rows use `circle-check` / `loader-circle` lucide glyphs and a flatter
 * tone (no left-accent active fill; `$muted-foreground-subtle` pending).
 *
 * Controlled, presentational leaf: `elapsedLabel` arrives pre-formatted (the
 * component never runs a timer) → no state/effects, server-safe, no "use client".
 */

/** One row of the live step log. */
export interface ResearchJobStep {
  /** The step's lifecycle state. */
  state: "done" | "active" | "pending";
  /** The step label (e.g. `Reading source 3 of 6`). */
  label: string;
  /** Optional trailing meta on a `done` step (e.g. `8 RESULTS`). */
  meta?: string;
  /** Optional source suffix on an `active` step (e.g. `tankwatown.org`). */
  source?: string;
}

export interface ResearchJobPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The task under research (DM Sans, `$foreground`). */
  taskName: string;
  /** Pre-formatted elapsed timer string, e.g. `00:42` (never computed here). */
  elapsedLabel: string;
  /** Current step index for the `Step X of Y` meta line (desktop). */
  currentStep?: number;
  /** Total step count for the `Step X of Y` meta line (desktop). */
  totalSteps?: number;
  /** Scope note appended to the meta line, e.g. `reading sources` (desktop). */
  stepNote?: string;
  /** The live step log rows, top → bottom. */
  steps: ResearchJobStep[];
  /** Show the `STREAMING` `$success` indicator in the log head. Default `true`. */
  streaming?: boolean;
  /** Desktop (two stacked cards) or mobile (single card) rendering. */
  variant?: "desktop" | "mobile";
}

/** Mobile log row — flatter than the desktop ResearchStepRow (no left accent). */
function MobileStepRow({
  state,
  label,
}: {
  state: ResearchJobStep["state"];
  label: string;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex w-4 shrink-0 items-center justify-center">
        {state === "done" ? (
          <CircleCheck
            aria-hidden="true"
            className="size-[15px] shrink-0 text-success"
          />
        ) : null}
        {state === "active" ? (
          <LoaderCircle
            aria-hidden="true"
            className="size-[15px] shrink-0 animate-spin text-primary"
          />
        ) : null}
        {state === "pending" ? (
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-muted-foreground-subtle"
          />
        ) : null}
      </span>
      <span
        className={cn(
          "flex-1 font-mono text-[12px]",
          state === "done" && "font-medium text-foreground",
          state === "active" && "font-semibold text-primary",
          state === "pending" && "font-medium text-muted-foreground-subtle",
        )}
      >
        {label}
      </span>
    </div>
  );
}

const ResearchJobPanel = React.forwardRef<
  HTMLDivElement,
  ResearchJobPanelProps
>(
  (
    {
      taskName,
      elapsedLabel,
      currentStep,
      totalSteps,
      stepNote,
      steps,
      streaming = true,
      variant = "desktop",
      className,
      ...props
    },
    ref,
  ) => {
    if (variant === "mobile") {
      return (
        // NO `role="status"` on the container: it would (a) nest a live region
        // around the inner `role="log"` step list → doubled announcements, and
        // (b) wrap the per-second elapsed timer in a live region → the time read
        // out every tick. The `role="log"` below is the single intended live region.
        <div
          ref={ref}
          className={cn(
            "flex flex-col gap-3.5 border border-border bg-card p-4",
            className,
          )}
          {...props}
        >
          {/* Top — inlined timer (no separate ELAPSED block on mobile). */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <LoaderCircle
                aria-hidden="true"
                className="size-[15px] shrink-0 animate-spin text-primary"
              />
              <span className="font-mono text-[12px] font-bold uppercase tracking-[1.5px] text-primary">
                Researching…
              </span>
            </div>
            <span className="shrink-0 font-mono text-[13px] font-bold tracking-[1px] tabular-nums text-foreground">
              {elapsedLabel}
            </span>
          </div>

          <p className="text-[15px] font-semibold text-foreground">
            {taskName}
          </p>

          <ProgressBar
            indeterminate
            height={4}
            label={`Researching ${taskName}`}
          />

          {/* Log — inline mobile rows (flatter than desktop). role=log +
              aria-live so screen readers hear each step as it streams in. */}
          <div
            role="log"
            aria-live="polite"
            className="flex flex-col gap-[9px]"
          >
            {steps.map((step, i) => (
              <MobileStepRow key={i} state={step.state} label={step.label} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn("flex flex-col gap-5", className)}
        {...props}
      >
        {/* (a) Research Job card — 2px $primary top accent. No `role="status"`:
            it wraps the per-second elapsed timer, which would be re-announced every
            tick. The LIVE STEP LOG's `role="log"` (below) is the single live region. */}
        <div className="flex flex-col border border-border bg-card">
          <div aria-hidden="true" className="h-0.5 w-full bg-primary" />
          <div className="flex flex-col gap-[18px] p-[22px]">
            {/* JobHead — status + scope on the left, ELAPSED block on the right. */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-col gap-2">
                <div className="flex items-center gap-[9px]">
                  <span
                    aria-hidden="true"
                    className="size-[18px] shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
                  />
                  <span className="font-mono text-[12px] font-bold uppercase tracking-[1.5px] text-primary">
                    Researching…
                  </span>
                </div>
                <span className="text-[22px] font-bold leading-tight text-foreground">
                  {taskName}
                </span>
                {stepNote ? (
                  <span className="text-[13px] text-muted-foreground">
                    {stepNote}
                  </span>
                ) : null}
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[2px] text-muted-foreground-subtle">
                  Elapsed
                </span>
                <span className="font-mono text-[30px] font-bold leading-none tracking-[1px] tabular-nums text-foreground">
                  {elapsedLabel}
                </span>
              </div>
            </div>

            {/* Indeterminate sweep — reuse the shared ProgressBar. */}
            <ProgressBar
              indeterminate
              height={4}
              label={`Researching ${taskName}`}
            />

            {/* ProgMeta — Step X of Y · note  ·····  NO FIXED ETA. */}
            <div className="flex items-center justify-between gap-3">
              <span className="font-mono text-[11px] tracking-[0.5px] text-muted-foreground">
                {currentStep != null && totalSteps != null
                  ? `Step ${currentStep} of ${totalSteps}`
                  : null}
                {currentStep != null && totalSteps != null && stepNote
                  ? ` · ${stepNote}`
                  : null}
              </span>
              <span className="shrink-0 font-mono text-[10px] uppercase tracking-[1.5px] text-muted-foreground-subtle">
                No fixed ETA
              </span>
            </div>
          </div>
        </div>

        {/* (b) LIVE STEP LOG card. */}
        <div className="flex flex-col border border-border bg-card">
          <div className="flex items-center justify-between gap-3 border-b border-border bg-muted px-[18px] py-3">
            <span className="font-mono text-[12px] font-bold uppercase tracking-[2px] text-muted-foreground">
              Live step log
            </span>
            {streaming ? (
              <div className="flex items-center gap-[7px]">
                <span
                  aria-hidden="true"
                  className="size-[7px] shrink-0 rounded-full bg-success"
                />
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[1.5px] text-success">
                  Streaming
                </span>
              </div>
            ) : null}
          </div>
          <div role="log" aria-live="polite" className="flex flex-col py-2">
            {steps.map((step, i) => (
              <ResearchStepRow
                key={i}
                state={step.state}
                label={step.label}
                meta={step.meta}
                source={step.source}
              />
            ))}
          </div>
        </div>
      </div>
    );
  },
);
ResearchJobPanel.displayName = "ResearchJobPanel";

export { ResearchJobPanel };
