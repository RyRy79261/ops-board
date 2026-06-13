import * as React from "react";

import { cn } from "../lib/utils";

/**
 * ResearchAttachedBadge — the small badge binding a live research job to a task
 * card (`03-surfaces/ai-research.md` §2.4, Target Card `ResearchBadge` `l3MpUu`).
 *
 * Anatomy: a `$primary/12` fill + 1px `$primary` border pill-less box (sharp,
 * `--radius:0`), `gap 6`, `padding [4,8]`, items-center — a 6px `$primary` pulse
 * dot (CSS `animate-pulse`, decorative) + `RESEARCHING` (JetBrains Mono 10/700
 * `$primary`, letterSpacing 1) + an OPTIONAL trailing elapsed timer (same mono
 * 10/700 `$primary`). The canonical atom supports the elapsed timer though the
 * Target Card instance omits it (§4, ResearchAttachedBadge `researching` state).
 *
 * A11y: `role="status"` announces the in-progress condition; the label carries
 * the accessible text, and when an `elapsedLabel` is present it is appended to
 * the announced value. The pulse dot is decorative (`aria-hidden`).
 *
 * Presentational, CONTROLLED leaf — the elapsed value arrives pre-formatted as a
 * prop (the component never runs a timer) → server-safe, no "use client".
 */
export interface ResearchAttachedBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** UPPERCASE mono label. Default `RESEARCHING`. */
  label?: string;
  /** Pre-formatted elapsed timer (e.g. `00:42`). Omit to render no timer. */
  elapsedLabel?: string;
}

const ResearchAttachedBadge = React.forwardRef<
  HTMLSpanElement,
  ResearchAttachedBadgeProps
>(({ label = "RESEARCHING", elapsedLabel, className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      role="status"
      className={cn(
        "inline-flex items-center gap-1.5 border border-primary bg-primary/12 px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[1px] text-primary",
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 animate-pulse rounded-full bg-primary"
      />
      {label}
      {elapsedLabel ? (
        <span className="font-mono text-[10px] font-bold text-primary">
          {elapsedLabel}
        </span>
      ) : null}
    </span>
  );
});
ResearchAttachedBadge.displayName = "ResearchAttachedBadge";

export { ResearchAttachedBadge };
