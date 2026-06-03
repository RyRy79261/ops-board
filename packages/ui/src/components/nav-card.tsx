import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Timer, CircleCheckBig, type LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

// NavCard — a selectable mission row in the 280px sidebar (ADAPT of camp-404
// nav-card.tsx). Mission name (DM Sans subtitle) over a meta line: a
// window-summary chip (nearest-cliff aggregate state) + a `{done}/{total} tasks`
// count. Built on the Card recipe (sharp, $card surface). Selection drives the
// main view — the only sidebar interaction. Presentational/controlled: state
// lives with the caller, so this stays a server-safe leaf (no "use client").

// ── window-summary chip — NOT a per-task WindowStatePill; summarises the
//    mission's nearest-cliff window. Tones/copy: warning (T-Nd / CLOSING),
//    success (COMPLETE), cat-bureaucratic (canonical default), muted. ─────────
const chipVariants = cva(
  "inline-flex items-center gap-1 rounded-full px-[7px] py-0.5 font-mono text-micro font-semibold leading-none",
  {
    variants: {
      tone: {
        warning: "bg-warning/12 text-warning",
        success: "bg-success/12 text-success",
        "cat-bureaucratic":
          "bg-cat-bureaucratic/12 text-cat-bureaucratic",
        muted: "bg-muted text-muted-foreground",
      },
    },
    defaultVariants: { tone: "cat-bureaucratic" },
  },
);

export type NavCardChipTone = NonNullable<
  VariantProps<typeof chipVariants>["tone"]
>;

export interface NavCardChip {
  /** Chip copy, e.g. 'T-3d', 'CLOSING', 'COMPLETE'. */
  label: string;
  /** Tone of the aggregate window-state. */
  tone: NavCardChipTone;
  /** Override the leading lucide glyph. Defaults to `timer` (cliff). */
  icon?: LucideIcon;
}

// `timer` is the screen-authoritative cliff icon (diverges from brief §8 Clock).
const chipDefaultIcon: Record<NavCardChipTone, LucideIcon> = {
  warning: Timer,
  success: CircleCheckBig,
  "cat-bureaucratic": Timer,
  muted: Timer,
};

const navCardVariants = cva(
  // sharp (radius-0) bordered $card box; vertical stack, padding 14, gap 8.
  // Min 44px tap height. Card recipe + selectable-list-item interaction.
  "flex w-full min-h-11 flex-col items-start gap-2 border p-3.5 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      active: {
        // active/selected → primary/12 wash + primary border
        true: "bg-primary/12 border-primary",
        // resting → $card + $border; hover lifts border to $border-hover
        false: "bg-card border-border hover:border-border-hover",
      },
    },
    defaultVariants: { active: false },
  },
);

export interface NavCardProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Mission name. */
  name: string;
  /** Completed task count for the count line. */
  done: number;
  /** Total task count. */
  total: number;
  /** Window-summary chip (nearest-cliff state). Omit if no cliff cue. */
  chip?: NavCardChip;
  /** Selected mission → primary/12 fill + primary border + aria-current. */
  active?: boolean;
}

const NavCard = React.forwardRef<HTMLButtonElement, NavCardProps>(
  ({ name, done, total, chip, active = false, className, ...props }, ref) => {
    const ChipIcon = chip ? (chip.icon ?? chipDefaultIcon[chip.tone]) : null;
    return (
      <button
        ref={ref}
        type="button"
        aria-current={active ? "true" : undefined}
        className={cn(navCardVariants({ active }), className)}
        {...props}
      >
        <span className="text-subtitle font-semibold text-foreground">
          {name}
        </span>
        <span className="flex items-center gap-2">
          {chip && ChipIcon && (
            <span className={cn(chipVariants({ tone: chip.tone }))}>
              <ChipIcon aria-hidden className="size-[11px]" />
              {chip.label}
            </span>
          )}
          <span className="font-mono text-caption text-muted-foreground">
            {done}/{total} tasks
          </span>
        </span>
      </button>
    );
  },
);
NavCard.displayName = "NavCard";

export { NavCard, navCardVariants, chipVariants };
