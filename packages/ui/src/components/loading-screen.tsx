import * as React from "react";

import { cn } from "../lib/utils";
import { Skeleton, skeletonBlockVariants } from "./skeleton";

/**
 * LoadingScreen — the app-shell first-paint skeleton (organism, canonical `lLfcN`).
 *
 * The full-screen counterpart to the bare list `Skeleton`: a 220px `$muted`
 * sidebar (brand + subtitle bars over 5 nav bars) beside a main column (title +
 * lead bars over `cardCount` TaskCard-shaped Skeleton rows). Per the states spec
 * (`states.md` §4/§7) the sidebar is a `showSidebar` toggle so the same organism
 * serves both the app-shell (sidebar+main) and the list-only variant.
 *
 * Purely presentational / decorative — the container carries `aria-busy='true'`
 * and an accessible label; every shimmer block is `aria-hidden` (via Skeleton /
 * the shared block recipe). Shimmer is suppressed under `prefers-reduced-motion`.
 */
export interface LoadingScreenProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Render the 220px sidebar skeleton (app-shell variant). Default true. */
  showSidebar?: boolean;
  /** Number of skeleton task-card rows in the main column. Default 3. */
  cardCount?: number;
}

const LoadingScreen = React.forwardRef<HTMLDivElement, LoadingScreenProps>(
  ({ showSidebar = true, cardCount = 3, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        aria-busy="true"
        aria-label="Loading"
        className={cn("flex min-h-0 flex-1", className)}
        {...props}
      >
        {showSidebar ? (
          // 220px $muted rail (desktop only) — brand/sub bars + 5 nav bars.
          <div
            aria-hidden="true"
            className="hidden w-[220px] shrink-0 flex-col gap-2 border-r border-border bg-muted p-[18px] md:flex"
          >
            <span
              className={cn(skeletonBlockVariants(), "h-[18px] w-[120px]")}
            />
            <span
              className={cn(skeletonBlockVariants(), "mb-3 h-3 w-[80px] bg-card")}
            />
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={cn(skeletonBlockVariants(), "h-11 w-full")}
              />
            ))}
          </div>
        ) : null}
        {/* Main column — header bars + stacked TaskCard-shaped skeleton rows. */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 p-8">
          <Skeleton headerBars count={cardCount} />
        </div>
      </div>
    );
  },
);
LoadingScreen.displayName = "LoadingScreen";

export { LoadingScreen };
