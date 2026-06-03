import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

// Shared substrate for CategoryTag / WindowStatePill / StatusBadge.
// Base uppercase tracked pill (rounded-full — LOCKED #2 exception to --radius:0).
// Presentational (no state), so it stays a server-safe leaf usable in any tree.
// Tints normalized /15 → /12 per §7 (hex `1f` ≈ 12% alpha).
const badgeVariants = cva(
  "inline-flex items-center gap-[5px] rounded-full px-2.5 py-1 font-mono text-micro font-semibold uppercase tracking-wide leading-none transition-colors",
  {
    variants: {
      variant: {
        // Base 3 (showcase RcvKu)
        outline: "border border-border text-muted-foreground hover:border-border-hover",
        muted: "border-transparent bg-muted text-muted-foreground",
        accent: "border-transparent bg-primary/12 text-primary hover:bg-primary/18",
      },
    },
    defaultVariants: { variant: "outline" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  /** Optional leading 12×12 Lucide glyph (redundant channel, LOCKED #6). */
  icon?: LucideIcon;
  /** Optional leading 6px ellipse dot (redundant channel, LOCKED #6). */
  dot?: boolean;
}

function Badge({ className, variant, icon: Icon, dot, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot ? (
        <span
          aria-hidden="true"
          className="size-1.5 shrink-0 rounded-full bg-current"
        />
      ) : null}
      {Icon ? <Icon aria-hidden="true" className="size-3 shrink-0" /> : null}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
