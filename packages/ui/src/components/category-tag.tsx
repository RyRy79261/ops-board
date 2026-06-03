import * as React from "react";
import {
  Backpack,
  Cpu,
  FileText,
  Plane,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * CategoryTag — the 5-tone category pill (LOCKED #6: three redundant channels —
 * hue + Lucide icon + uppercase label, never colour alone). Built on the Badge
 * substrate's cat-* CVA shape: a 12%-tint fill (`bg-cat-x/12`) + same-hue ~40%
 * outline (`border-cat-x/40`) on the tinted pill, with the §4-authoritative icon
 * set (Stethoscope / FileText / Plane / Backpack / Cpu — board glyph drift like
 * pill/route/package is rejected).
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */

/** §4 authoritative category map: hue token + Lucide glyph + uppercase label. */
type Category = "medical" | "bureaucratic" | "travel" | "gear" | "tech";

const CATEGORY_META: Record<
  Category,
  { icon: LucideIcon; label: string }
> = {
  medical: { icon: Stethoscope, label: "MEDICAL" },
  bureaucratic: { icon: FileText, label: "BUREAUCRATIC" },
  travel: { icon: Plane, label: "TRAVEL" },
  gear: { icon: Backpack, label: "GEAR" },
  tech: { icon: Cpu, label: "TECH" },
};

const categoryTagVariants = cva(
  // mono uppercase tracked label; icon + label inline. Sharp by default — the
  // pill mode opts into the rounded-full LOCKED #2 exception.
  "inline-flex shrink-0 items-center gap-1.5 font-mono font-semibold uppercase tracking-wide whitespace-nowrap [&>svg]:size-3 [&>svg]:shrink-0",
  {
    variants: {
      category: {
        medical: "bg-cat-medical/12 border-cat-medical/40 text-cat-medical",
        bureaucratic:
          "bg-cat-bureaucratic/12 border-cat-bureaucratic/40 text-cat-bureaucratic",
        travel: "bg-cat-travel/12 border-cat-travel/40 text-cat-travel",
        gear: "bg-cat-gear/12 border-cat-gear/40 text-cat-gear",
        tech: "bg-cat-tech/12 border-cat-tech/40 text-cat-tech",
      },
      variant: {
        // showcase canonical: tinted rounded-full pill (cornerRadius 999),
        // padding [4,10], with the same-hue /40 outline on the tinted surface.
        pill: "rounded-full border px-2.5 py-1 text-micro",
        // dense Category / mobile cards: sharp (radius-0), borderless, padding [3,8].
        inline: "border-0 px-2 py-0.5 text-micro-xs",
      },
      dimmed: {
        // blocked / not-yet parent → grey the whole tag to $muted-foreground.
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      // dimmed overrides the category hue (fill, border, text) with the muted
      // grey treatment regardless of which category was passed.
      {
        dimmed: true,
        className:
          "border-border bg-transparent text-muted-foreground [&>svg]:text-muted-foreground",
      },
    ],
    defaultVariants: {
      category: "medical",
      variant: "pill",
      dimmed: false,
    },
  },
);

export interface CategoryTagProps
  extends Omit<React.HTMLAttributes<HTMLSpanElement>, "color">,
    Omit<VariantProps<typeof categoryTagVariants>, "category" | "dimmed"> {
  /** Drives hue + Lucide icon + label per §4. */
  category: Category;
  /** Leading 6px category-coloured dot (timeline / deps / mobile cards). */
  showDot?: boolean;
  /** Greys icon + label to $muted-foreground when the parent is blocked/not-yet. */
  dimmed?: boolean;
}

const DOT_TONE: Record<Category, string> = {
  medical: "bg-cat-medical",
  bureaucratic: "bg-cat-bureaucratic",
  travel: "bg-cat-travel",
  gear: "bg-cat-gear",
  tech: "bg-cat-tech",
};

const CategoryTag = React.forwardRef<HTMLSpanElement, CategoryTagProps>(
  (
    { className, category, variant, showDot = false, dimmed = false, ...props },
    ref,
  ) => {
    const { icon: Icon, label } = CATEGORY_META[category];

    return (
      <span
        ref={ref}
        className={cn(
          categoryTagVariants({ category, variant, dimmed }),
          className,
        )}
        {...props}
      >
        {showDot ? (
          <span
            aria-hidden="true"
            className={cn(
              "size-1.5 shrink-0 rounded-full",
              dimmed ? "bg-muted-foreground" : DOT_TONE[category],
            )}
          />
        ) : null}
        <Icon aria-hidden="true" />
        {label}
      </span>
    );
  },
);
CategoryTag.displayName = "CategoryTag";

export { CategoryTag, categoryTagVariants };
