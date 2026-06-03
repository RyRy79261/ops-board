"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Check } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * StatusCycleButton — the ONE direct board interaction (§10, LOCKED #4).
 *
 * An 18px SHARP square (NOT a checkbox, NOT rounded — §5 exception) carrying the
 * stored tri-state task status via a 2px state-colored border + glyph/fill:
 *   not-started → empty square, $border 2px (hover → $success)
 *   in-progress → $primary border + primary/12 wash + ◼ glyph in $primary
 *   done        → $success border + $success fill + ✓ glyph in $background (near-black)
 *
 * ALWAYS ENABLED (§10): window-state / blocked are advisory and never gate this
 * control — it is the single interaction on the read-only board, so it must never
 * go dead. The `disabled` prop exists for API completeness but should not be set
 * on the board. Tapping advances the wrapping cycle via `onCycle`.
 *
 * Renders a real <button> (role=button, NOT role=checkbox) and MUST be wrapped in
 * the exported Touch44 (≥44px hit area) — every board omits it; the contract requires it.
 */
const statusCycleButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border-[2px] font-mono leading-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      status: {
        "not-started": "border-border bg-transparent hover:border-success",
        "in-progress": "border-primary bg-primary/12 text-primary",
        done: "border-success bg-success text-background",
      },
    },
    defaultVariants: {
      status: "not-started",
    },
  },
);

type StatusCycleStatus = "not-started" | "in-progress" | "done";

const STATUS_LABEL: Record<StatusCycleStatus, string> = {
  "not-started": "not started",
  "in-progress": "in progress",
  done: "done",
};

/** Next status in the wrapping cycle: not-started → in-progress → done → not-started. */
const NEXT_STATUS: Record<StatusCycleStatus, StatusCycleStatus> = {
  "not-started": "in-progress",
  "in-progress": "done",
  done: "not-started",
};

export interface StatusCycleButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "onClick">,
    VariantProps<typeof statusCycleButtonVariants> {
  /** Stored status; cycles not-started→in-progress→done→(wrap) on activation (§10). */
  status: StatusCycleStatus;
  /** Advances status to the next in the wrapping cycle. Wired to update_task_status (optimistic). */
  onCycle: () => void;
  /**
   * Per §10 the button is ALWAYS ENABLED — window-state/blocked are advisory, never
   * gating. Should effectively never be true on the board.
   */
  disabled?: boolean;
  /** Box size in px (18 default). Must be wrapped in a ≥44px Touch44 target. */
  size?: number;
}

const StatusCycleButton = React.forwardRef<
  HTMLButtonElement,
  StatusCycleButtonProps
>(
  (
    { className, status, onCycle, size = 18, disabled = false, ...props },
    ref,
  ) => {
    const next = NEXT_STATUS[status];
    return (
      <button
        ref={ref}
        type="button"
        disabled={disabled}
        onClick={onCycle}
        aria-label={`Task status: ${STATUS_LABEL[status]}, activate to mark ${STATUS_LABEL[next]}`}
        style={{ width: size, height: size }}
        className={cn(statusCycleButtonVariants({ status }), className)}
        {...props}
      >
        {status === "in-progress" ? (
          // ◼ — solid square glyph (~8–9px) in $primary
          <span
            aria-hidden="true"
            className="block bg-primary"
            style={{ width: Math.round(size / 2), height: Math.round(size / 2) }}
          />
        ) : null}
        {status === "done" ? (
          // ✓ — near-black check on $success fill
          <Check
            aria-hidden="true"
            strokeWidth={3}
            style={{ width: Math.round(size * 0.7), height: Math.round(size * 0.7) }}
          />
        ) : null}
      </button>
    );
  },
);
StatusCycleButton.displayName = "StatusCycleButton";

export interface Touch44Props extends React.HTMLAttributes<HTMLSpanElement> {
  /** Minimum hit-area in px (44 default, the WCAG target-size floor). */
  min?: number;
}

/**
 * Touch44 — REQUIRED ≥44px tap-target wrapper for StatusCycleButton (every board omits
 * it; the contract mandates it for a11y / LOCKED #4). Centers the 18px square inside a
 * transparent 44×44 hit area; the wrapper itself is non-interactive (the inner button
 * carries the role/label).
 */
const Touch44 = React.forwardRef<HTMLSpanElement, Touch44Props>(
  ({ className, min = 44, style, ...props }, ref) => (
    <span
      ref={ref}
      style={{ minWidth: min, minHeight: min, ...style }}
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    />
  ),
);
Touch44.displayName = "Touch44";

export { StatusCycleButton, Touch44, statusCycleButtonVariants };
export type { StatusCycleStatus };
