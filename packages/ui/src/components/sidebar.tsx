import * as React from "react";

import { cn } from "../lib/utils";
import { Eyebrow } from "./eyebrow";

/**
 * Sidebar — the 280px left mission rail (organism, canonical `thUh3`). A muted
 * rail with a right hairline border, a "MISSIONS" eyebrow header, and a
 * scrollable list whose `children` are the mission rows (NavCards).
 *
 * Framework-agnostic by design: the app supplies the NavCards (and their
 * navigation — `<a href="?mission=ID">` wrapping, or NavCard `asChild`). The
 * Sidebar owns only the rail chrome + scroll, never the data or the routing.
 * Presentational shell — no state, server-safe (no "use client").
 *
 * The header is a `nav` landmark; the list scrolls when it overflows the rail.
 */
export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Mission rows — typically NavCards (each wrapping an `<a href="?mission=ID">`). */
  children: React.ReactNode;
  /** Eyebrow header label. Defaults to "MISSIONS". */
  title?: string;
}

const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  ({ children, title = "MISSIONS", className, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label={title}
        // 280px fixed rail (flex-shrink-0), $muted fill, 1px $border right rule,
        // clipped so the list scrolls inside the rail.
        className={cn(
          "flex h-full w-[280px] shrink-0 flex-col overflow-hidden border-r border-border bg-muted",
          className,
        )}
        {...props}
      >
        {/* SidebarHeader — padding 18, MISSIONS eyebrow mono 11/700 ls2 subtle. */}
        <div className="p-[18px]">
          <Eyebrow as="h2" tone="subtle" weight={700} tracking={2}>
            {title}
          </Eyebrow>
        </div>
        {/* MissionList — gap 8, padding [0,8], scrolls on overflow. */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2">
          {children}
        </div>
      </nav>
    );
  },
);
Sidebar.displayName = "Sidebar";

export { Sidebar };
