import * as React from "react";
import { CircleX, ExternalLink } from "lucide-react";

import { cn } from "../lib/utils";

/**
 * SourceRow — one source in an AINotesBlock SOURCES list (`04-voice-ai.md`,
 * molecule `ggMJH`), and the failed-source row in the ErrorStateCard
 * PARTIAL RESULTS variant.
 *
 * `status='ok'` (the normal anatomy): a category/domain-toned favicon dot +
 * domain (Mono 12/600 `$muted-foreground`) + title (DM Sans 13 `$foreground`,
 * fill) + an `external-link` icon. When `href` is set the icon opens the source
 * in a new tab.
 *
 * `status='failed'` is a STRUCTURALLY different layout (not a recolour): it
 * DROPS the favicon, title, and link, rendering `circle-x` `$warning` + domain
 * + an `UNREACHABLE` tag.
 *
 * `divider` adds the inter-row top hairline (rows 2+ of a list).
 *
 * Presentational leaf (no state) → server-safe, no "use client".
 */
export interface SourceRowProps extends React.HTMLAttributes<HTMLDivElement> {
  /** `ok` = normal source; `failed` = unreachable (PARTIAL RESULTS). */
  status?: "ok" | "failed";
  /** The source hostname (e.g. `tankwatown.org`). */
  domain: string;
  /** The source title (DM Sans, fill). `ok` only. */
  title?: string;
  /** Source URL — when set, the external-link icon opens it in a new tab. `ok` only. */
  href?: string;
  /** Tailwind background class for the 9px favicon dot (default muted). */
  faviconTone?: string;
  /** Render an inter-row top hairline divider (rows after the first). */
  divider?: boolean;
}

const SourceRow = React.forwardRef<HTMLDivElement, SourceRowProps>(
  (
    {
      status = "ok",
      domain,
      title,
      href,
      faviconTone = "bg-muted-foreground",
      divider = false,
      className,
      ...props
    },
    ref,
  ) => {
    if (status === "failed") {
      return (
        <div
          ref={ref}
          className={cn(
            "flex items-center gap-2 px-3 py-[9px]",
            divider && "border-t border-border",
            className,
          )}
          {...props}
        >
          <CircleX
            aria-hidden="true"
            className="size-[13px] shrink-0 text-warning"
          />
          <span className="flex-1 truncate font-mono text-[11px] text-foreground">
            {domain}
          </span>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[1px] text-warning">
            Unreachable
          </span>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-2.5 py-2.5",
          divider && "border-t border-border",
          className,
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={cn("size-[9px] shrink-0 rounded-full", faviconTone)}
        />
        <span className="shrink-0 font-mono text-[12px] font-semibold text-muted-foreground">
          {domain}
        </span>
        {title ? (
          <span className="flex-1 truncate text-[13px] text-foreground">
            {title}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        {href ? (
          <a
            href={href}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${domain} in a new tab`}
            className="shrink-0 text-muted-foreground-subtle outline-none transition-colors hover:text-foreground focus-visible:text-foreground"
          >
            <ExternalLink aria-hidden="true" className="size-3.5" />
          </a>
        ) : (
          <ExternalLink
            aria-hidden="true"
            className="size-3.5 shrink-0 text-muted-foreground-subtle"
          />
        )}
      </div>
    );
  },
);
SourceRow.displayName = "SourceRow";

export { SourceRow };
