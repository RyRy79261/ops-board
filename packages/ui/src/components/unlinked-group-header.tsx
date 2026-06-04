import * as React from "react";
import { Unlink } from "lucide-react";

import { cn } from "../lib/utils";
import { Eyebrow } from "./eyebrow";

/**
 * UnlinkedGroupHeader — the section break in the Dependencies tree for tasks
 * with no dependency edges (molecule, canonical `x00J9`). An `unlink` lucide
 * icon + an `UNLINKED` mono eyebrow + a `· {n} TASKS · NO DEPENDENCIES` count
 * suffix. Read-only divider; renders only when ≥1 unlinked task exists (the
 * caller gates it on `count > 0`).
 *
 * Dimming hierarchy is intentional: icon (most subtle) → label (muted) → count
 * (most subtle). The icon is decorative (aria-hidden); the UNLINKED label +
 * count carry the meaning textually. Rendered as a section heading (`<h3>` via
 * the Eyebrow `as`) so the group is reachable in the heading outline.
 */
export interface UnlinkedGroupHeaderProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of unlinked tasks — rendered into the count suffix. */
  count: number;
  /** Group label text (defaults to "UNLINKED"). */
  label?: string;
}

const UnlinkedGroupHeader = React.forwardRef<
  HTMLDivElement,
  UnlinkedGroupHeaderProps
>(({ count, label = "UNLINKED", className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("flex items-center gap-2 pt-2.5", className)}
      {...props}
    >
      <Unlink
        size={13}
        aria-hidden="true"
        className="shrink-0 text-muted-foreground-subtle"
      />
      <Eyebrow as="h3" tone="muted" weight={600} tracking={1.5}>
        {label}
      </Eyebrow>
      <span className="font-mono text-[11px] leading-none tracking-[1px] text-muted-foreground-subtle">
        {"·"} {count} {count === 1 ? "TASK" : "TASKS"} {"·"} NO DEPENDENCIES
      </span>
    </div>
  );
});
UnlinkedGroupHeader.displayName = "UnlinkedGroupHeader";

export { UnlinkedGroupHeader };
