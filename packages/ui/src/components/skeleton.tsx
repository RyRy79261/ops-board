import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Skeleton — loading placeholder (OpsBoard).
 *
 * A shimmer placeholder shaped like a `TaskCard`: an 18px box (the status seat)
 * + a full-width name bar + a meta row of two short bars. All blocks are
 * `bg-card-elevated` rectangles on the `$card` card shell (sharp `--radius:0`,
 * 1px `$border`). Stacked ×`count` to fill a list while loading.
 *
 * Purely presentational / decorative — no text, no interactive role. The
 * loading container should carry `aria-busy='true'`; the skeleton itself is
 * `aria-hidden`. Shimmer uses `animate-pulse` and is suppressed under
 * `prefers-reduced-motion` (via the `motion-safe:` variant).
 *
 * Variants (contract UNION):
 * - `default` — box + name bar + 2-bar Tags row
 * - `wide`    — box + name bar only (the showcase `Skeleton · wide`; Tags off)
 *
 * Drift honoured: `lineWidths` overrides the canon `fill`/[70,90] bar widths
 * (TvXzz uses a fixed name 240 + tags), `showStatusBox` drops the 18px seat,
 * `headerBars` prepends the loose TvXzz `skTitle`/`skSub` header lines, and
 * `count` renders N stacked rows (the boards show 3).
 */

/** A single shimmer block. `bg-card-elevated`, sharp radius-0, pulse when animated. */
const skeletonBlockVariants = cva("block bg-card-elevated", {
  variants: {
    animate: {
      true: "motion-safe:animate-pulse",
      false: "",
    },
  },
  defaultVariants: {
    animate: true,
  },
});

const skeletonVariants = cva(
  "relative flex w-full items-start gap-3 overflow-hidden border border-border bg-card p-3.5 shadow-e1",
  {
    variants: {
      variant: {
        default: "",
        wide: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

/** Resolve a number|'fill' width into an inline style + className fragment. */
function resolveWidth(width: number | "fill" | undefined, fallback: string) {
  if (width === undefined) return { className: fallback, style: undefined };
  if (width === "fill") return { className: "w-full", style: undefined };
  return { className: undefined, style: { width: width } };
}

export interface SkeletonProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Render the 18px status-seat box (mirrors the TaskCard StatusCycleButton). */
  showStatusBox?: boolean;
  /** Override bar widths. `name`: number px or 'fill'. `tags`: per-bar px widths. */
  lineWidths?: { name?: number | "fill"; tags?: number[] };
  /** Prepend the loose TvXzz header bars (skTitle 190×18 + skSub 120×12). */
  headerBars?: boolean;
  /** Convenience: render N stacked rows (the boards show 3). */
  count?: number;
  /** Shimmer/pulse animation (suppressed under prefers-reduced-motion). */
  animate?: boolean;
}

/** One TaskCard-shaped placeholder row. */
const SkeletonRow = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      variant = "default",
      showStatusBox = true,
      lineWidths,
      animate = true,
      ...props
    },
    ref
  ) => {
    const name = resolveWidth(lineWidths?.name, "w-full");
    const tagWidths = lineWidths?.tags ?? [70, 90];

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn(skeletonVariants({ variant }), className)}
        {...props}
      >
        {showStatusBox ? (
          <span
            className={cn(skeletonBlockVariants({ animate }), "size-[18px] shrink-0")}
          />
        ) : null}
        <div className="flex w-full flex-col gap-[9px]">
          {/* name bar */}
          <span
            className={cn(skeletonBlockVariants({ animate }), name.className, "h-3.5")}
            style={name.style}
          />
          {/* meta row — disabled on the `wide` variant */}
          {variant === "wide" ? null : (
            <div className="flex items-center gap-2">
              {tagWidths.map((w, i) => (
                <span
                  key={i}
                  className={cn(skeletonBlockVariants({ animate }), "h-3")}
                  style={{ width: w }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }
);
SkeletonRow.displayName = "SkeletonRow";

/**
 * Skeleton — renders `count` stacked TaskCard-shaped placeholder rows, optionally
 * preceded by the loose TvXzz header bars. A single row when `count` is 1.
 */
const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ headerBars = false, count = 1, animate = true, className, ...props }, ref) => {
    const rows = Math.max(1, count);

    // A lone row with no header bars renders directly (no extra wrapper).
    if (!headerBars && rows === 1) {
      return (
        <SkeletonRow ref={ref} animate={animate} className={className} {...props} />
      );
    }

    return (
      <div
        ref={ref}
        aria-hidden="true"
        className={cn("flex w-full flex-col gap-3", className)}
      >
        {headerBars ? (
          <div className="flex flex-col gap-2.5">
            {/* skTitle 190×18 $card-elevated */}
            <span
              className={cn(
                skeletonBlockVariants({ animate }),
                "h-[18px] w-[190px]"
              )}
            />
            {/* skSub 120×12 — canon notes $card fill, kept as the dimmer block */}
            <span
              className={cn(skeletonBlockVariants({ animate }), "h-3 w-[120px] bg-card")}
            />
          </div>
        ) : null}
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonRow key={i} animate={animate} {...props} />
        ))}
      </div>
    );
  }
);
Skeleton.displayName = "Skeleton";

export { Skeleton, SkeletonRow, skeletonVariants, skeletonBlockVariants };
