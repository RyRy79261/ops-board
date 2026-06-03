"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import type { LucideIcon } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * IconButton — square, icon-only header/toolbar affordance.
 *
 * Maps to shadcn/ui "new-york" Button at `size="icon"` (camp-404 button.tsx
 * LIFT, icon size), re-skinned to OpsBoard tokens. 36×36 visible box, sharp
 * radius-0, Lucide glyph at 16×16. The icon-only control carries no visible
 * text, so `aria-label` is mandatory and the Lucide glyph is aria-hidden.
 *
 * The 36×36 frame is the visual box; on touch the control still presents a
 * ≥44px effective hit area via the negative-margin pseudo-target. The
 * orange-on-near-black `primary` fill passes AA.
 */
const iconButtonVariants = cva(
  // sharp radius-0; 16×16 glyph; ≥44px touch hit area via ::before; focus ring
  "relative inline-flex size-9 shrink-0 items-center justify-center rounded-none font-mono transition-colors before:absolute before:left-1/2 before:top-1/2 before:size-11 before:-translate-x-1/2 before:-translate-y-1/2 before:content-[''] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        ghost:
          "bg-transparent text-muted-foreground hover:bg-card hover:text-foreground",
        primary:
          "bg-primary text-primary-foreground hover:bg-primary-hover",
        outline:
          "border border-border bg-transparent text-muted-foreground hover:border-border-hover hover:bg-card hover:text-foreground",
      },
    },
    defaultVariants: {
      variant: "ghost",
    },
  },
);

export interface IconButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children">,
    VariantProps<typeof iconButtonVariants> {
  /** Lucide glyph rendered at 16×16. */
  icon: LucideIcon;
  /** REQUIRED accessible name (icon-only control has no visible text). */
  "aria-label": string;
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, icon: Icon, type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(iconButtonVariants({ variant }), className)}
        {...props}
      >
        <Icon aria-hidden="true" />
      </button>
    );
  },
);
IconButton.displayName = "IconButton";

export { IconButton, iconButtonVariants };
