import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ResearchStepRow — one row of the ResearchJobPanel LIVE STEP LOG
 * (`04-voice-ai.md`, molecule `hHAnh`). Three states drive the glyph + tone:
 *  - `done` — a `$success` check + `$foreground` label + optional trailing
 *    `meta` (e.g. `8 RESULTS`, `tankwa land-use`).
 *  - `active` — an arc spinner + `$primary` 700 label, with the row HIGHLIGHTED
 *    (`$card-elevated` fill + 2px `$primary` left accent) and an optional `source`
 *    suffix (e.g. `· tankwatown.org`).
 *  - `pending` — a small `$muted-foreground-subtle` dot + muted label.
 *
 * This is the PROGRESS-LOG row — deliberately distinct from the AINotesBlock's
 * numbered result steps (which carry citations). Presentational leaf, server-safe.
 */
export interface ResearchStepRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** The step's lifecycle state. */
  state: "done" | "active" | "pending";
  /** The step label (e.g. `Reading source 3 of 6`). */
  label: string;
  /** Optional trailing meta on a `done` step (e.g. `8 RESULTS`). */
  meta?: string;
  /** Optional source suffix on an `active` step (e.g. `tankwatown.org`). */
  source?: string;
}

const ResearchStepRow = React.forwardRef<HTMLDivElement, ResearchStepRowProps>(
  ({ state, label, meta, source, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-[11px]",
          state === "active"
            ? "border-l-2 border-l-primary bg-card-elevated px-4 py-2.5"
            : "px-[18px] py-2",
          className,
        )}
        {...props}
      >
        <span className="flex w-4 shrink-0 items-center justify-center">
          {state === "done" ? (
            <Check
              aria-hidden="true"
              strokeWidth={3}
              className="size-3.5 text-success"
            />
          ) : null}
          {state === "active" ? (
            <span
              aria-hidden="true"
              className="size-[13px] animate-spin rounded-full border-2 border-primary/30 border-t-primary"
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
            "font-mono text-[13px]",
            state === "done" && "text-foreground",
            state === "active" && "font-bold text-primary",
            state === "pending" && "text-muted-foreground",
          )}
        >
          {label}
        </span>
        {state === "done" && meta ? (
          <span className="font-mono text-[11px] tracking-[0.5px] text-muted-foreground-subtle">
            {meta}
          </span>
        ) : null}
        {state === "active" && source ? (
          <span className="font-mono text-[12px] text-muted-foreground">
            · {source}
          </span>
        ) : null}
      </div>
    );
  },
);
ResearchStepRow.displayName = "ResearchStepRow";

export { ResearchStepRow };
