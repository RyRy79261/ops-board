import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Circle, CircleDot, Check } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * StatusBadge — stored task-status pill (§10). Composes the Badge substrate
 * (rounded-full pill, mono uppercase label + icon). Presentational leaf, so
 * it stays server-safe (no "use client").
 *
 * Reflects the THREE stored statuses only — not-started / in-progress / done.
 * 'blocked' is intentionally NOT a value: it is derived and folds into the
 * window/not-yet treatment (→ WindowStatePill), never a StatusBadge.
 *
 * Redundant channels (LOCKED #6): icon + uppercase label + color — never
 * color alone. The uppercase status word is the accessible text; the Lucide
 * icon is aria-hidden.
 */
const statusBadgeVariants = cva(
  // shared Badge substrate: rounded-full pill (LOCKED #2 exception to radius-0),
  // mono uppercase tracked micro label, 12×12 leading glyph.
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-micro font-semibold uppercase leading-none tracking-wide transition-colors",
  {
    variants: {
      status: {
        // bordered: 1px $border stroke, $muted-foreground label
        "not-started": "",
        // tinted: primary/12 wash, no stroke, $primary label
        "in-progress": "",
        // tinted: success/12 wash, no stroke, $success label
        done: "",
      },
      variant: {
        bordered: "border",
        tinted: "border-0",
      },
    },
    compoundVariants: [
      // not-started — bordered is its canonical render
      {
        status: "not-started",
        variant: "bordered",
        className: "border-border text-muted-foreground",
      },
      {
        status: "not-started",
        variant: "tinted",
        className: "bg-muted text-muted-foreground",
      },
      // in-progress — primary/12 tint
      {
        status: "in-progress",
        variant: "tinted",
        className: "bg-primary/12 text-primary",
      },
      {
        status: "in-progress",
        variant: "bordered",
        className: "border-primary text-primary",
      },
      // done — success/12 tint
      {
        status: "done",
        variant: "tinted",
        className: "bg-success/12 text-success",
      },
      {
        status: "done",
        variant: "bordered",
        className: "border-success text-success",
      },
    ],
    defaultVariants: {
      status: "not-started",
      variant: "bordered",
    },
  },
);

/**
 * Per-status icon + accessible label. Contract anatomy names circle-dot for
 * not-started; in-progress fills it (CircleDot), done resolves to a check —
 * all three redundant with color + the uppercase word (LOCKED #6).
 */
const STATUS_META = {
  "not-started": { Icon: Circle, label: "NOT STARTED" },
  "in-progress": { Icon: CircleDot, label: "IN PROGRESS" },
  done: { Icon: Check, label: "DONE" },
} as const;

type StatusValue = keyof typeof STATUS_META;

export interface StatusBadgeProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof statusBadgeVariants> {
  /** Stored task status (§10). NOT 'blocked' — blocked is derived. */
  status: StatusValue;
}

/**
 * Defaults the render mode per status when `variant` is omitted: not-started →
 * bordered, in-progress/done → tinted (matches the showcase RcvKu base cells).
 */
const DEFAULT_VARIANT: Record<StatusValue, "bordered" | "tinted"> = {
  "not-started": "bordered",
  "in-progress": "tinted",
  done: "tinted",
};

export function StatusBadge({
  className,
  status,
  variant,
  ...props
}: StatusBadgeProps) {
  const resolvedVariant = variant ?? DEFAULT_VARIANT[status];
  const { Icon, label } = STATUS_META[status];

  return (
    <span
      className={cn(
        statusBadgeVariants({ status, variant: resolvedVariant }),
        className,
      )}
      {...props}
    >
      <Icon className="size-3 shrink-0" aria-hidden="true" />
      {label}
    </span>
  );
}

export { statusBadgeVariants };
