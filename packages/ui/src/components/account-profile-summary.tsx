import * as React from "react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";

/**
 * AccountProfileSummary — the read-only profile card (molecule, canonical).
 *
 * An elevated `$card-elevated` card: a circular `$primary` initials avatar +
 * name/email + a meta row (member-since caption + a tinted plan pill)
 * (`07-asm-debug.md` §AccountProfileSummary). Editing lives behind a Manage nav
 * row, not here. Presentational leaf — server-safe.
 */
export interface AccountProfileSummaryProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Display name; falls back to the email local-part when absent. */
  name?: string;
  /** Primary email. */
  email: string;
  /** Pre-formatted "member since" line (e.g. `Member since 03 Jun 2026`). */
  memberSince?: string;
  /** Plan pill label. Default `SOLO OPERATOR`. */
  plan?: string;
}

/** Up-to-two-character initials from a name (or the email local-part). */
function initialsOf(name: string | undefined, email: string): string {
  const source = name?.trim() || email.split("@")[0] || "?";
  const parts = source.split(/[\s._-]+/).filter(Boolean);
  const letters =
    parts.length >= 2
      ? `${parts[0]![0]}${parts[1]![0]}`
      : source.slice(0, 2);
  return letters.toUpperCase();
}

const AccountProfileSummary = React.forwardRef<
  HTMLDivElement,
  AccountProfileSummaryProps
>(({ name, email, memberSince, plan = "SOLO OPERATOR", className, ...props }, ref) => {
  const displayName = name?.trim() || email.split("@")[0] || email;
  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center gap-[18px] border border-border bg-card-elevated p-[22px]",
        className,
      )}
      {...props}
    >
      {/* Circular $primary initials avatar — the one rounded element here. */}
      <span
        aria-hidden="true"
        className="flex size-14 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[18px] font-bold text-primary-foreground"
      >
        {initialsOf(name, email)}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <span className="truncate font-sans text-[18px] font-bold text-foreground">
          {displayName}
        </span>
        <span className="truncate font-mono text-caption text-muted-foreground">
          {email}
        </span>
        <div className="mt-1 flex items-center gap-2">
          {memberSince ? (
            <span className="font-mono text-eyebrow uppercase tracking-[1px] text-muted-foreground-subtle">
              {memberSince}
            </span>
          ) : null}
          <Badge>{plan}</Badge>
        </div>
      </div>
    </div>
  );
});
AccountProfileSummary.displayName = "AccountProfileSummary";

export { AccountProfileSummary };
