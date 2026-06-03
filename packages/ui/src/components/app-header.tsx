import * as React from "react";

import { cn } from "../lib/utils";

/**
 * AppHeader — persistent top chrome for the desktop 3-pane shell (organism,
 * canonical `E5VLtZ`). Sticky muted bar with a hairline bottom border, ~61px
 * tall (design-brief §11, z-100). Left = the OPS/BOARD wordmark (JetBrains
 * Mono 16/700, letter-spacing 4px); right = an optional actions slot.
 *
 * On the Category/Timeline product boards the right cluster is omitted (the
 * wordmark sits alone under `justify-between`). The desktop Category screen
 * passes no `right`, so it renders wordmark-only. Other surfaces can pass a
 * SyncStatus / operator block into `right`.
 *
 * Framework-agnostic: no next/* imports. Presentational leaf — no state, so it
 * stays server-safe (no "use client").
 */
export interface AppHeaderProps extends React.HTMLAttributes<HTMLElement> {
  /** Optional right-cluster slot (SyncStatus / operator block). Omit for wordmark-only. */
  right?: React.ReactNode;
}

const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  ({ right, className, ...props }, ref) => {
    return (
      <header
        ref={ref}
        // sticky muted bar, 1px $border bottom rule, padding [20,32],
        // space-between so the wordmark sits left and the right cluster (if any)
        // sits right. z-100 per §11.
        className={cn(
          "sticky top-0 z-[100] flex w-full items-center justify-between border-b border-border bg-muted px-8 py-5",
          className,
        )}
        {...props}
      >
        {/* Wordmark: OPS (primary) / BOARD (muted-foreground), mono 16/700 ls4. */}
        <span className="flex items-center font-mono text-[16px] font-bold tracking-[4px]">
          <span className="text-primary">OPS</span>
          <span className="text-muted-foreground">BOARD</span>
        </span>
        {right ? (
          <div className="flex items-center gap-4">{right}</div>
        ) : null}
      </header>
    );
  },
);
AppHeader.displayName = "AppHeader";

export { AppHeader };
