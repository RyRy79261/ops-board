import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

// Eyebrow — the shared mono uppercase micro-label (--text-eyebrow, JetBrains
// Mono, wide tracking) used for section/task-group/sidebar headers, StatTile
// labels and CategoryGroupHeader labels. Presentational typography role.
// `tone` carries the color step (§6); `weight`/`tracking` cover the heavier
// "Label/Eyebrow" cell. Renders uppercase via CSS `uppercase`; pass `as` to
// title a real section with a semantic element instead of a bare span.
const eyebrowVariants = cva(
  "font-mono uppercase text-eyebrow leading-none",
  {
    variants: {
      tone: {
        muted: "text-muted-foreground",
        foreground: "text-foreground",
        accent: "text-primary",
        subtle: "text-muted-foreground-subtle",
      },
      weight: {
        600: "font-semibold",
        700: "font-bold",
      },
    },
    defaultVariants: {
      tone: "muted",
      weight: 600,
    },
  },
);

type EyebrowVariantProps = VariantProps<typeof eyebrowVariants>;

export interface EyebrowProps
  extends Omit<React.HTMLAttributes<HTMLElement>, "color">,
    EyebrowVariantProps {
  /** Label text; rendered UPPERCASE (mono caps). */
  children: React.ReactNode;
  /**
   * letterSpacing in px; 1.5 base, 2 heavy. Overrides the token default
   * (--text-eyebrow ≈ 0.125em) when provided.
   */
  tracking?: number;
  /**
   * Element to render. Use a semantic heading/label element where it titles a
   * section (e.g. "h2", "label"); defaults to a presentational span.
   */
  as?: React.ElementType;
}

const Eyebrow = React.forwardRef<HTMLElement, EyebrowProps>(
  (
    { as: Component = "span", tone, weight, tracking = 1.5, className, style, children, ...props },
    ref,
  ) => {
    return (
      <Component
        ref={ref}
        className={cn(eyebrowVariants({ tone, weight }), className)}
        style={{ letterSpacing: `${tracking}px`, ...style }}
        {...props}
      >
        {children}
      </Component>
    );
  },
);
Eyebrow.displayName = "Eyebrow";

export { Eyebrow, eyebrowVariants };
