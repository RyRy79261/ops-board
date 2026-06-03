import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * OpsBoard Button — LIFTed from camp-404 button.tsx, re-skinned via OpsBoard
 * tokens (tactical-orange-on-near-black, sharp radius-0, mono labels).
 *
 * 6 variants × 5 sizes. Scoped to voice/toast/error/settings surfaces — the
 * three read-only board views never render a Button (LOCKED #4). Icon-only use
 * routes through size="icon" with an aria-label (see IconButton contract).
 *
 * Label type: JetBrains Mono 13 / 600 / +0.5 tracking (chrome label, LOCKED #5).
 */
const buttonVariants = cva(
  "inline-flex items-center justify-center gap-[7px] whitespace-nowrap font-mono text-mono font-semibold tracking-[0.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary-hover",
        secondary:
          "border border-border bg-secondary text-secondary-foreground hover:border-border-hover",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground hover:border-border-hover",
        ghost:
          "bg-transparent text-foreground hover:bg-accent hover:text-accent-foreground",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        link: "bg-transparent text-primary underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-8 px-3",
        base: "px-4 py-[9px]",
        lg: "h-11 px-6",
        xl: "h-12 px-8",
        icon: "size-9",
      },
    },
    compoundVariants: [
      // link drops horizontal padding → [9,0] per the contract.
      { variant: "link", size: "base", class: "px-0" },
    ],
    defaultVariants: {
      variant: "primary",
      size: "base",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Radix Slot passthrough (shadcn new-york convention). */
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
