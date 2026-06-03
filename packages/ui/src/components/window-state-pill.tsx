import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Clock, XCircle, AlertTriangle, Lock, Circle } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * WindowStatePill — the core window-state carrier (§9). Composes the Badge
 * substrate (uppercase mono tracked pill) and re-skins it per computed window
 * state. The window state is NEVER stored: a parent computes it via
 * @opsboard/core window-state.ts (driven by use-now-tick 60s) and passes the
 * result + countdown in. The pill is purely presentational → server-safe leaf.
 *
 * §9 / LOCKED #3 colour law: closed + blocked are MUTED grey, never panic-red.
 * The deps board $destructive closed-pill drift is rejected here.
 * §8 canonical icon set: Clock / XCircle / AlertTriangle / Lock — board glyph
 * drifts (timer / alarm-clock / ban / lock-for-closed / x) are rejected.
 */

export type WindowState =
  | "open"
  | "closing"
  | "closed"
  | "not-yet"
  | "blocked";

const windowStatePillVariants = cva(
  // Base: uppercase mono tracked pill. rounded-full is the LOCKED #2 exception
  // to --radius:0; the `bare` variant resets radius + padding for inline cards.
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-micro font-semibold uppercase leading-none tracking-[0.5px] whitespace-nowrap align-middle transition-colors",
  {
    variants: {
      state: {
        open: "text-muted-foreground",
        closing: "text-warning",
        closed: "text-muted-foreground",
        "not-yet": "text-muted-foreground-subtle",
        blocked: "text-muted-foreground",
      },
      // Render modes (§ render modes): bordered (showcase open) · tinted
      // (filled state/12, no stroke — deps/timeline/mobile) · bare (no
      // stroke/no radius inline — Category cards).
      variant: {
        bordered: "border",
        tinted: "border-0",
        bare: "rounded-none border-0 px-0 py-0",
      },
    },
    compoundVariants: [
      // bordered strokes per state colour.
      { variant: "bordered", state: "open", class: "border-border" },
      { variant: "bordered", state: "closing", class: "border-warning/40" },
      { variant: "bordered", state: "closed", class: "border-border" },
      { variant: "bordered", state: "not-yet", class: "border-border" },
      { variant: "bordered", state: "blocked", class: "border-border" },
      // tinted fills at state/12 (closing) or $muted for the grey states.
      { variant: "tinted", state: "open", class: "bg-muted" },
      { variant: "tinted", state: "closing", class: "bg-warning/12" },
      { variant: "tinted", state: "closed", class: "bg-muted" },
      { variant: "tinted", state: "not-yet", class: "bg-muted" },
      { variant: "tinted", state: "blocked", class: "bg-muted" },
    ],
    defaultVariants: { state: "open", variant: "tinted" },
  },
);

// §8 canonical icon per state. `null` for open when collapsing to a bare date.
const STATE_ICON: Record<
  WindowState,
  React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>
> = {
  open: Circle,
  closing: Clock,
  closed: XCircle,
  "not-yet": Lock,
  blocked: AlertTriangle,
};

// Default uppercase phrase per state. closing/open with a countdown append
// the T-{n}d suffix; closed/not-yet append a trailing date in a subtle span.
const STATE_LABEL: Record<WindowState, string> = {
  open: "OPEN",
  closing: "CLOSING",
  closed: "WINDOW CLOSED",
  "not-yet": "NOT YET",
  blocked: "BLOCKED",
};

export interface WindowStatePillProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof windowStatePillVariants> {
  /** Computed window state (NEVER stored). Precedence resolved upstream (§9). */
  state: WindowState;
  /** closing → 'CLOSING · T-{n}d'; open w/ countdown → 'OPEN · T-{n}d'. */
  daysUntil?: number;
  /** Plain real-world date: OPEN renders date-only; closed/not-yet append it. */
  date?: string;
  /**
   * Open-window decision (§16 #4). When false (default, "absence = healthy")
   * an open window with no countdown/date renders nothing. When the open state
   * carries a `date` it collapses to the plain-date overload (bare date, no
   * icon) regardless of this flag.
   */
  showOpen?: boolean;
  /** Override the uppercase phrase (aggregate-summary overload: 'ON TRACK' …). */
  label?: string;
  /** Hide the leading icon (plain-date overload / aggregate dot rows). */
  hideIcon?: boolean;
}

function WindowStatePill({
  state,
  daysUntil,
  date,
  variant,
  showOpen = false,
  label,
  hideIcon = false,
  className,
  ...props
}: WindowStatePillProps) {
  // OPEN collapse rules (§ open / plain-date overload):
  //  • open + date  → bare date only, no icon, subtle tone (plain-date overload)
  //  • open + no date + no countdown + !showOpen → render nothing (healthy)
  const isPlainDate = state === "open" && !!date && daysUntil === undefined;
  const openSilent =
    state === "open" &&
    !date &&
    daysUntil === undefined &&
    !showOpen &&
    !label;

  if (openSilent) return null;

  const Icon = STATE_ICON[state];
  const showIcon = !hideIcon && !isPlainDate;

  // Build the uppercase phrase + optional countdown suffix.
  let phrase = label ?? STATE_LABEL[state];
  if (!label && daysUntil !== undefined && (state === "closing" || state === "open")) {
    phrase = `${phrase} · T-${daysUntil}d`;
  }

  // Trailing real-world date: closed appends a date; not-yet appends 'starts'.
  let trailingDate: string | null = null;
  if (date && !isPlainDate) {
    if (state === "not-yet") trailingDate = `starts ${date}`;
    else if (state === "closed") trailingDate = date;
  }

  return (
    <span
      className={cn(
        windowStatePillVariants({ state, variant }),
        // Plain-date overload renders as a subtle, normal-weight date token.
        isPlainDate && "font-normal text-muted-foreground-subtle",
        className,
      )}
      {...props}
    >
      {showIcon ? <Icon className="size-3 shrink-0" aria-hidden /> : null}
      {isPlainDate ? (
        date
      ) : (
        <>
          <span>{phrase}</span>
          {trailingDate ? (
            <span className="font-normal text-muted-foreground-subtle">
              {trailingDate}
            </span>
          ) : null}
        </>
      )}
    </span>
  );
}

export { WindowStatePill, windowStatePillVariants };
