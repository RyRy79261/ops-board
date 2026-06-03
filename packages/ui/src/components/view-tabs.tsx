"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * ViewTabs — the view switcher between the three core board views
 * (`BY CATEGORY · TIMELINE · DEPENDENCIES`). ADAPTED from camp-404
 * segmented-control.tsx (design-brief §14: ViewTabs → SegmentedControl),
 * re-skinned from the boxed segmented chrome into an underline tab bar via
 * OpsBoard tokens.
 *
 * Canonical anatomy (bPiGP): a `bg-muted` bar with a 1px `$border` bottom rule,
 * 28px inter-tab gap, 0×32 padding. Each tab is mono 12/700 ls 1.5 uppercase:
 *   active   → `$primary` label + a 2px `$primary` bottom border
 *   inactive → `$muted-foreground` label, no border
 *   hover    → label lifts to `$foreground`
 *
 * Drift resolved (P0): the Category/Dependencies boards leak a stray inactive
 * `stroke:$primary` (no width/side). Build to the clean showcase — inactive
 * tabs carry NO primary stroke.
 *
 * Controlled only: `value` + `onValueChange`. role=tablist with role=tab
 * children, aria-selected + roving-tabindex arrow-key navigation; the active
 * underline is the redundant (non-color) cue alongside aria-selected.
 */
const viewTabsListVariants = cva(
  "flex w-full items-center gap-7 bg-muted px-8 shadow-[inset_0_-1px_0_0_var(--color-border)]",
);

const viewTabsTriggerVariants = cva(
  "relative -mb-px inline-flex cursor-pointer items-center border-b-2 border-transparent bg-transparent py-[14px] font-mono text-caption font-bold uppercase leading-none tracking-[1.5px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
  {
    variants: {
      active: {
        true: "border-primary text-primary",
        false: "text-muted-foreground hover:text-foreground",
      },
    },
    defaultVariants: {
      active: false,
    },
  },
);

/** The three fixed views; one is active at a time (matches the active board). */
export type ViewTabValue = "category" | "timeline" | "dependencies";

export interface ViewTab {
  value: ViewTabValue;
  label: string;
}

/** Fixed 3-tab set — order matches the board (§11). */
const DEFAULT_TABS: ViewTab[] = [
  { value: "category", label: "BY CATEGORY" },
  { value: "timeline", label: "TIMELINE" },
  { value: "dependencies", label: "DEPENDENCIES" },
];

export interface ViewTabsProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, "onChange">,
    Omit<VariantProps<typeof viewTabsListVariants>, "active"> {
  /** Active view (controlled). */
  value: ViewTabValue;
  /** Switch-view callback fired on click / arrow-key selection. */
  onValueChange: (value: ViewTabValue) => void;
  /** Override the fixed 3-tab set (BY CATEGORY · TIMELINE · DEPENDENCIES). */
  tabs?: ViewTab[];
  /** Accessible name for the tablist. */
  "aria-label"?: string;
}

const ViewTabs = React.forwardRef<HTMLDivElement, ViewTabsProps>(
  (
    {
      className,
      value,
      onValueChange,
      tabs = DEFAULT_TABS,
      "aria-label": ariaLabel = "Board view",
      ...props
    },
    ref,
  ) => {
    const triggerRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

    function focusSelect(index: number) {
      // Wrap around; the modulo on a non-negative base handles -1 → last.
      const target = (index + tabs.length) % tabs.length;
      const next = tabs[target];
      if (!next) return;
      onValueChange(next.value);
      triggerRefs.current[target]?.focus();
    }

    function onKeyDown(e: React.KeyboardEvent, index: number) {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        focusSelect(index + 1);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        focusSelect(index - 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        focusSelect(0);
      } else if (e.key === "End") {
        e.preventDefault();
        focusSelect(tabs.length - 1);
      }
    }

    const selectedIndex = tabs.findIndex((t) => t.value === value);

    return (
      <div
        ref={ref}
        role="tablist"
        aria-label={ariaLabel}
        aria-orientation="horizontal"
        className={cn(viewTabsListVariants(), className)}
        {...props}
      >
        {tabs.map((tab, i) => {
          const active = tab.value === value;
          // Roving tabindex: the active tab (or the first, when none matches)
          // is the single tab stop into the tablist.
          const tabbable = active || (selectedIndex === -1 && i === 0);
          return (
            <button
              key={tab.value}
              ref={(el) => {
                triggerRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`view-tab-${tab.value}`}
              aria-selected={active}
              aria-controls={`view-panel-${tab.value}`}
              tabIndex={tabbable ? 0 : -1}
              onClick={() => onValueChange(tab.value)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={cn(viewTabsTriggerVariants({ active }))}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
    );
  },
);
ViewTabs.displayName = "ViewTabs";

export { ViewTabs, viewTabsListVariants, viewTabsTriggerVariants, DEFAULT_TABS };
