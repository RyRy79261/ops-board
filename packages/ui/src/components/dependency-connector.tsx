import * as React from "react";
import { CornerDownRight } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * DependencyConnector — the `↳` glyph cell that prefixes a dependent (depth > 0)
 * node in the Dependencies tree (atom, canonical `P5mv8T`). A fixed 36×38 flex
 * cell holding an 18px `corner-down-right` lucide icon, centered both axes so it
 * lines up against the TaskCard row to its right.
 *
 * The ONLY visual difference between the two variants is the glyph fill:
 * - `default`  → `$muted-foreground-subtle` (a neutral connector).
 * - `critical` → `$primary` (the node is on the critical path — the folded
 *   CriticalPathAccent). Critical emphasis is paired with the CRITICAL PATH
 *   legend chip so it is never color-only (LOCKED #6 / a11y).
 *
 * The glyph is decorative — the dependency relationship is conveyed structurally
 * by the tree nesting + the blocked-by reason line, so the icon is aria-hidden.
 */
const connectorVariants = cva(
  "flex h-[38px] w-9 shrink-0 items-center justify-center",
  {
    variants: {
      variant: {
        default: "text-muted-foreground-subtle",
        critical: "text-primary",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

type ConnectorVariantProps = VariantProps<typeof connectorVariants>;

export interface DependencyConnectorProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    ConnectorVariantProps {}

const DependencyConnector = React.forwardRef<
  HTMLSpanElement,
  DependencyConnectorProps
>(({ variant, className, ...props }, ref) => {
  return (
    <span
      ref={ref}
      aria-hidden="true"
      className={cn(connectorVariants({ variant }), className)}
      {...props}
    >
      <CornerDownRight size={18} strokeWidth={2} />
    </span>
  );
});
DependencyConnector.displayName = "DependencyConnector";

export { DependencyConnector, connectorVariants };
