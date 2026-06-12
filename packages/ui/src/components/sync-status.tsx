import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * SyncStatus — the liveness / operator indicator (atom, canonical `ht6vH`).
 *
 * Two renderings through ONE component (tech-spec 02-components/06-chrome-nav §SyncStatus):
 *  - **plain** (default): a 6×6 status dot + an uppercase mono caps label
 *    (`SYNCED`), mono 10/500, letter-spacing 1.5. The showcase/mobile idiom.
 *  - **operator block**: when `leadingLabel` and/or `dateLabel` are supplied, the
 *    same dot+label idiom widens to a 3-part block —
 *    `SOLO OPERATOR` ($muted-foreground-subtle) · live dot · `12 JUN 2026`
 *    ($muted-foreground) — mono 11/normal, letter-spacing 1. This is the
 *    Dependencies-desktop header's right cluster, folded into SyncStatus rather
 *    than a separate component (per the reconciliation note).
 *
 * `state` drives the dot colour (synced → $success, syncing → $warning, offline →
 * $muted-foreground) and the default plain label. Presentational leaf — no state,
 * server-safe (no "use client"). The decorative dot is `aria-hidden`; the label
 * text carries the accessible signal.
 */
export type SyncState = "synced" | "syncing" | "offline";

const dotVariants = cva("inline-block size-1.5 shrink-0", {
  variants: {
    state: {
      synced: "bg-success",
      syncing: "bg-warning",
      offline: "bg-muted-foreground",
    },
  },
  defaultVariants: { state: "synced" },
});

const STATE_LABEL: Record<SyncState, string> = {
  synced: "SYNCED",
  syncing: "SYNCING…",
  offline: "OFFLINE",
};

export interface SyncStatusProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dotVariants> {
  /** Liveness state — drives the dot colour + default plain label. */
  state?: SyncState;
  /** Override the uppercase mono caps label (plain rendering). */
  label?: string;
  /** Optional leading label (e.g. `SOLO OPERATOR`) → switches to the operator block. */
  leadingLabel?: string;
  /** Optional trailing date/label (e.g. `12 JUN 2026`) → switches to the operator block. */
  dateLabel?: string;
}

const SyncStatus = React.forwardRef<HTMLDivElement, SyncStatusProps>(
  (
    { state = "synced", label, leadingLabel, dateLabel, className, ...props },
    ref,
  ) => {
    // The operator block (leading and/or trailing date) uses 11/normal/ls1; the
    // plain dot+label uses the showcase 10/500/ls1.5. The trailing label prefers
    // the explicit date, then an explicit label, then the state default — so an
    // operator block with only a `leadingLabel` still shows the sync label
    // rather than a bare dot.
    const isOperator = leadingLabel != null || dateLabel != null;
    const trailing = dateLabel ?? label ?? STATE_LABEL[state];

    return (
      <div
        ref={ref}
        className={cn("inline-flex items-center gap-1.5", className)}
        {...props}
      >
        {leadingLabel != null ? (
          <span className="font-mono text-[11px] font-normal uppercase tracking-[1px] text-muted-foreground-subtle">
            {leadingLabel}
          </span>
        ) : null}
        <span aria-hidden="true" className={cn(dotVariants({ state }))} />
        <span
          className={cn(
            "font-mono uppercase text-muted-foreground",
            isOperator
              ? "text-[11px] font-normal tracking-[1px]"
              : "text-[10px] font-medium tracking-[1.5px]",
          )}
        >
          {trailing}
        </span>
      </div>
    );
  },
);
SyncStatus.displayName = "SyncStatus";

export { SyncStatus, dotVariants as syncStatusDotVariants };
