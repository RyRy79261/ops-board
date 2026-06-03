import * as React from "react";

import { cn } from "../lib/utils";

// Thin 1px rule for separating content (shadcn Separator equivalent). Horizontal
// by default; pass `orientation="vertical"` inside a flex row (the parent must
// give it height). `tone` picks the hairline weight ($border vs $border-hover).
// LIFTed verbatim from camp-404 divider.tsx; token-driven, re-skins via OKLCH.
//
// NOTE: this covers the STANDALONE rule only. Element bottom-borders
// (strokeWidth {bottom:1}) are a `border-b` prop on the parent, NOT a Divider.
export interface DividerProps extends React.HTMLAttributes<HTMLDivElement> {
  orientation?: "horizontal" | "vertical";
  /** Hairline weight: $border (default) or the stronger $border-hover. */
  tone?: "border" | "border-hover";
  /**
   * Purely decorative dividers should set `decorative` so the rule is hidden
   * from the a11y tree (aria-hidden + role="none"). Defaults to a semantic
   * role="separator" with the matching aria-orientation.
   */
  decorative?: boolean;
}

function Divider({
  orientation = "horizontal",
  tone = "border",
  decorative = false,
  className,
  ...props
}: DividerProps) {
  return (
    <div
      role={decorative ? "none" : "separator"}
      aria-hidden={decorative || undefined}
      aria-orientation={decorative ? undefined : orientation}
      className={cn(
        "shrink-0",
        tone === "border" ? "bg-border" : "bg-border-hover",
        orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
        className,
      )}
      {...props}
    />
  );
}

export { Divider };
