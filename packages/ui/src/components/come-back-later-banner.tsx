import * as React from "react";
import { Bell, Coffee, Minimize2 } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * ComeBackLaterBanner — the "leave and we'll notify you" reassurance banner on
 * the AI Research surface. Two structurally distinct variants (not a recolour):
 *
 *  - `primary` (desktop §2.2 (c) `gboRN`, AUTHORITATIVE): a `$primary/8` fill
 *    with a 2px `$primary` LEFT accent, a 32px `coffee` icon wrap (`$primary/12`)
 *    + a two-line text block, and a right-aligned action pair — an outline
 *    MINIMIZE (`minimize-2`) + a fill COME BACK LATER (`bell`, `$primary`).
 *  - `muted` (mobile §3.2 (c) `a6QbQc`, canonical Alert shape): a `$muted` fill
 *    with a 1px border, a single `bell` glyph + one DM Sans line, and NO buttons.
 *
 * Controlled leaf: the actions are `on*` handler props; nothing is computed here.
 * Presentational (no state) → server-safe, no "use client".
 */
export interface ComeBackLaterBannerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Desktop accent banner (`primary`) vs. mobile muted Alert (`muted`). Default `primary`. */
  variant?: "primary" | "muted";
  /** Bold title (DM Sans 14/700). `primary` only — the `muted` variant has no separate title. */
  title?: string;
  /** Reassurance body sentence (DM Sans 13, `$muted-foreground`). */
  body?: string;
  /** MINIMIZE button handler (rendered in the `primary` variant only). */
  onMinimize?: () => void;
  /** COME BACK LATER button handler (rendered in the `primary` variant only). */
  onComeBackLater?: () => void;
}

const ComeBackLaterBanner = React.forwardRef<
  HTMLDivElement,
  ComeBackLaterBannerProps
>(
  (
    {
      variant = "primary",
      title = "Running in the background",
      body,
      onMinimize,
      onComeBackLater,
      className,
      ...props
    },
    ref,
  ) => {
    if (variant === "muted") {
      return (
        <div
          ref={ref}
          role="status"
          className={cn(
            "flex items-center gap-2.5 border border-border bg-muted p-[13px]",
            className,
          )}
          {...props}
        >
          <Bell
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground"
          />
          <p className="flex-1 text-[13px] text-muted-foreground">
            {body ??
              "Running in the background — you can leave. We'll notify you when it's ready."}
          </p>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        role="status"
        className={cn(
          "flex items-center gap-4 border-l-2 border-l-primary bg-primary/8 px-[18px] py-4",
          className,
        )}
        {...props}
      >
        <div className="flex flex-1 items-center gap-[13px]">
          <span
            aria-hidden="true"
            className="flex size-8 shrink-0 items-center justify-center bg-primary/12"
          >
            <Coffee className="size-[17px] text-primary" />
          </span>
          <div className="flex min-w-0 flex-col gap-[3px]">
            <span className="text-[14px] font-bold text-foreground">
              {title}
            </span>
            <span className="text-[13px] text-muted-foreground">
              {body ??
                "You can leave — we'll notify you the moment results are ready."}
            </span>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onMinimize}
            className="inline-flex items-center gap-[7px] border border-border-hover bg-transparent px-3.5 py-[9px] font-mono text-[11px] font-bold uppercase tracking-[1px] text-muted-foreground outline-none transition-colors hover:border-foreground focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Minimize2 aria-hidden="true" className="size-[13px]" />
            Minimize
          </button>
          <button
            type="button"
            onClick={onComeBackLater}
            className="inline-flex items-center gap-[7px] bg-primary px-3.5 py-[9px] font-mono text-[11px] font-bold uppercase tracking-[1px] text-primary-foreground outline-none transition-colors hover:bg-primary/90 focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Bell aria-hidden="true" className="size-[13px]" />
            Come back later
          </button>
        </div>
      </div>
    );
  },
);
ComeBackLaterBanner.displayName = "ComeBackLaterBanner";

export { ComeBackLaterBanner };
