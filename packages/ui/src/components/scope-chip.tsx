import * as React from "react";
import { Lock, Target } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ScopeChip — the locked-mission scope indicator at the top of the AI Research
 * body (`03-surfaces/ai-research.md` §B.2.1 desktop `OF7vE` and §C.2.1 / §3.2(a)
 * mobile `NJgUC`/`TvJEp`). Signals that every utterance is interpreted within
 * the active mission taxonomy. Two STRUCTURALLY distinct renderings (not a
 * recolour):
 *
 *  - `locked` (desktop, AUTHORITATIVE): `$card` fill + a FULL 1px `$primary`
 *    border → lucide `lock` 14 `$primary` + `SCOPE` (Mono 11 `$muted-foreground`
 *    ls1.5) + `·` separator (`$muted-foreground-subtle`) + the mission value
 *    UPPERCASE (Mono 12/700 `$foreground` ls1) + a small `$muted` `LOCKED` tag
 *    (Mono 9 `$primary` ls1.5).
 *  - `compact` (mobile): `bg-primary/12` tint + a LEFT 2px `$primary` accent
 *    only → lucide `target` 14 `$primary` + `SCOPE · {mission}` (Mono 11/700
 *    `$primary` ls1). No LOCKED tag.
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
export interface ScopeChipProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The locked mission value (e.g. `AfrikaBurn 2026`). UPPERCASED in `locked`. */
  mission: string;
  /** Desktop `locked` (default) vs mobile `compact`. */
  variant?: "locked" | "compact";
}

const ScopeChip = React.forwardRef<HTMLDivElement, ScopeChipProps>(
  ({ mission, variant = "locked", className, ...props }, ref) => {
    if (variant === "compact") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 border-l-2 border-l-primary bg-primary/12 px-3 py-2.5",
            className,
          )}
          {...props}
        >
          <Target aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
          <span className="font-mono text-[11px] font-bold tracking-[1px] text-primary">
            SCOPE · {mission}
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2.5 border border-primary bg-card px-3.5 py-[9px]",
          className,
        )}
        {...props}
      >
        <Lock aria-hidden="true" className="size-3.5 shrink-0 text-primary" />
        <span className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground">
          SCOPE
        </span>
        <span aria-hidden="true" className="font-mono text-[11px] text-muted-foreground-subtle">
          ·
        </span>
        <span className="font-mono text-[12px] font-bold uppercase tracking-[1px] text-foreground">
          {mission}
        </span>
        <span className="bg-muted px-[7px] py-[3px] font-mono text-[9px] uppercase tracking-[1.5px] text-primary">
          Locked
        </span>
      </div>
    );
  },
);
ScopeChip.displayName = "ScopeChip";

export { ScopeChip };
