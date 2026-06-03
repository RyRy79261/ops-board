import * as React from "react";
import {
  Info,
  TriangleAlert,
  OctagonAlert,
  type LucideIcon,
} from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * Alert — persistent inline advisory banner (non-toast). A 2px left-accent
 * border + a tone/12 tinted fill, a leading Lucide icon, an uppercase mono
 * title and a DM Sans body. Distinct from Toast (transient, top-accent bar).
 *
 * Tone is one of three (LOCKED #3 — no panic-red for time pressure):
 *   - info (default): $info aliases the brand orange (#ff6b35) — lucide `info`.
 *   - warning: amber "closing"/time-pressure advisories — `triangle-alert`.
 *   - destructive: genuine danger / blocked-by-upstream only — `octagon-alert`.
 *
 * Fill = tone at 12% (§7 canonical alpha); left accent + icon + title text are
 * the solid tone; the body is always $foreground regardless of tone.
 *
 * Redundant channels (LOCKED #6): icon + uppercase title + colour — never
 * colour alone. The icon is decorative (aria-hidden); the title carries the
 * meaning. Presentational leaf → server-safe, no "use client".
 */
const alertVariants = cva(
  // sharp (radius-0) bordered box; the accent lives on the left edge only.
  "flex w-full items-start gap-3 border-l-2 p-3.5",
  {
    variants: {
      variant: {
        // $info = $primary (orange) wash + accent; lucide `info`.
        info: "border-l-primary bg-primary/12",
        // amber "closing" advisory; `triangle-alert`.
        warning: "border-l-warning bg-warning/12",
        // genuine danger / blocked-by-upstream; `octagon-alert`.
        destructive: "border-l-destructive bg-destructive/12",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

/** Title colour tracks the tone (icon + title = solid tone). */
const titleToneVariants = cva(
  // mono 12/700, 1px-tracked, uppercase, tight leading.
  "font-mono text-caption font-bold uppercase leading-none tracking-wide",
  {
    variants: {
      variant: {
        info: "text-primary",
        warning: "text-warning",
        destructive: "text-destructive",
      },
    },
    defaultVariants: { variant: "info" },
  },
);

/** Icon colour tracks the tone. */
const iconToneVariants = cva("mt-px size-[18px] shrink-0", {
  variants: {
    variant: {
      info: "text-primary",
      warning: "text-warning",
      destructive: "text-destructive",
    },
  },
  defaultVariants: { variant: "info" },
});

type AlertVariant = NonNullable<VariantProps<typeof alertVariants>["variant"]>;

/** Default Lucide glyph per tone (overridable via the `icon` prop). */
const DEFAULT_ICON: Record<AlertVariant, LucideIcon> = {
  info: Info,
  warning: TriangleAlert,
  destructive: OctagonAlert,
};

export interface AlertProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof alertVariants> {
  /** Uppercase mono title (e.g. HEADS UP / WINDOW CLOSING / BLOCKED). */
  title: string;
  /** Body copy (DM Sans, $foreground). */
  children: React.ReactNode;
  /** Override the per-variant default Lucide icon. */
  icon?: LucideIcon;
}

export function Alert({
  className,
  variant,
  title,
  children,
  icon,
  ...props
}: AlertProps) {
  const tone: AlertVariant = variant ?? "info";
  const Icon = icon ?? DEFAULT_ICON[tone];

  return (
    <div
      // destructive/urgent assertively announced; info/warning are polite.
      role={tone === "destructive" ? "alert" : "status"}
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon className={iconToneVariants({ variant })} aria-hidden="true" />
      <div className="flex w-full flex-col gap-1.5">
        <span className={titleToneVariants({ variant })}>{title}</span>
        <p className="text-label leading-snug text-foreground">{children}</p>
      </div>
    </div>
  );
}

export { alertVariants };
