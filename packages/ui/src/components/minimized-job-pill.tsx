import * as React from "react";
import { ChevronUp } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * MinimizedJobPill — the docked floating job indicator (`03-surfaces/ai-research.md`,
 * desktop §2.5 `qogkb` / mobile §3.2(e) `C8uAS`). The ONLY rounded-full +
 * shadowed element on an otherwise zero-radius board — an intentional, spec-
 * authoritative `--radius:0` exception (alongside its annotation caption).
 *
 * Two structurally-distinct variants:
 *  - `docked` (desktop): `$card` fill, `rounded-full`, 1px `$primary` border, and
 *    an outer drop shadow. An arc spinner + name (Mono 13/700) + `·` separator +
 *    elapsed time (Mono 13/700 `$primary`) + a 24px `$card-elevated` Expand
 *    button (`chevron-up`).
 *  - `inline` (mobile): `$card-elevated` fill, SHARP (no radius, no shadow), 1px
 *    `$primary` border. Arc spinner + name (Mono 12/500) + time (Mono 12/700
 *    `$primary`). No separator dot, no Expand chevron.
 *
 * Presentational, CONTROLLED leaf: `elapsedLabel` arrives pre-formatted (the pill
 * never ticks a clock) and `onExpand` is a handler prop → server-safe, no state,
 * no "use client". The consumer is responsible for positioning (the pill itself
 * is NOT position:fixed).
 *
 * A11y: `role="status"` announces the running job; the spinner is decorative
 * (`aria-hidden`); Expand is a real `<button type="button">` with an accessible
 * label.
 */
export interface MinimizedJobPillProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The running task name (Mono — 13/700 docked, 12/500 inline). */
  taskName: string;
  /** Pre-formatted elapsed time, e.g. `00:42`. The pill never computes this. */
  elapsedLabel: string;
  /** Expand handler — only rendered in the `docked` variant. */
  onExpand?: () => void;
  /** `docked` = desktop rounded+shadow pill; `inline` = mobile sharp pill. */
  variant?: "docked" | "inline";
}

const MinimizedJobPill = React.forwardRef<HTMLDivElement, MinimizedJobPillProps>(
  (
    { taskName, elapsedLabel, onExpand, variant = "docked", className, ...props },
    ref,
  ) => {
    const docked = variant === "docked";

    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "inline-flex items-center border border-primary",
          docked
            ? "gap-[11px] rounded-full bg-card px-4 py-[11px] shadow-[0_6px_20px_#00000066]"
            : "gap-[9px] bg-card-elevated px-[14px] py-[10px]",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className="size-[14px] shrink-0 animate-spin rounded-full border-2 border-primary/30 border-t-primary"
        />
        <span
          className={cn(
            "font-mono text-foreground",
            docked ? "text-[13px] font-bold" : "text-[12px] font-medium",
          )}
        >
          {taskName}
        </span>
        {docked ? (
          <span
            aria-hidden="true"
            className="font-mono text-[13px] text-muted-foreground-subtle"
          >
            ·
          </span>
        ) : null}
        <span
          className={cn(
            "font-mono font-bold text-primary",
            docked ? "text-[13px] tracking-[1px]" : "text-[12px]",
          )}
        >
          {elapsedLabel}
        </span>
        {docked ? (
          <button
            type="button"
            onClick={onExpand}
            aria-label="Expand research job"
            className="inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-card-elevated text-muted-foreground outline-none transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ChevronUp aria-hidden="true" className="size-[13px]" />
          </button>
        ) : null}
      </div>
    );
  },
);
MinimizedJobPill.displayName = "MinimizedJobPill";

export { MinimizedJobPill };
