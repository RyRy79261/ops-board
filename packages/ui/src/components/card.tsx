import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../lib/utils";

/**
 * Card — the foundational elevated surface (OpsBoard).
 *
 * A *sharp* (`--radius:0`), 1px `border` box on the `card` fill, with `shadow-e1`.
 * Every card-like organism (TaskCard, MissionSummaryCard, NavCard, RecordingPanel,
 * Alert, EmptyState, Skeleton, the AI panels) is composed on this shell or shares
 * its recipe.
 *
 * The `variant` selects the screen-authoritative window-state surface recipe
 * (fill + left-accent stroke + opacity). It is driven by computed window-state,
 * never stored. `default` is the uniform 1px-border resting surface.
 *
 * Decorative container only — semantics come from its contents. `overflow-hidden`
 * clips the progress bar / left-accent fills. Left-accent state borders must never
 * be the sole state signal (they pair with the pill icon+label per LOCKED #6).
 */
const cardVariants = cva(
  "relative overflow-hidden bg-card text-card-foreground shadow-e1",
  {
    variants: {
      variant: {
        // open / in-progress / not-started — uniform 1px $border, full opacity
        default: "border border-border",
        // closing — left-2 $warning accent over $card
        closing: "border-l-2 border-l-warning",
        // blocked (not-yet, derived) — left-2 subtle accent, dimmed .6
        blocked: "border-l-2 border-l-muted-foreground-subtle opacity-60",
        // not-yet (not_before) — left-2 subtle accent, dimmed .6
        "not-yet": "border-l-2 border-l-muted-foreground-subtle opacity-60",
        // closed — $muted fill, left-2 $muted-foreground, dimmed .55
        closed: "bg-muted border-l-2 border-l-muted-foreground opacity-[0.55]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** shadcn Slot passthrough — render as the single child element. */
  asChild?: boolean;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "div";
    return (
      <Comp
        ref={ref}
        className={cn(cardVariants({ variant }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("flex flex-col gap-1.5 p-3.5", className)} {...props} />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-subtitle font-semibold leading-tight text-foreground",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-body text-muted-foreground", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-3.5 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-3.5 pt-0", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants,
};
