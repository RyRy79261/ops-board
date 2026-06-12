import * as React from "react";

import { cn } from "../lib/utils";

/**
 * LegalSection — one section of a legal document (molecule, canonical).
 *
 * A header (left `§NN` gutter marker + title) over a prose body of paragraphs,
 * lists and embedded CodeCallouts (`07-asm-debug.md` §LegalSection). The reading
 * unit of the Privacy / Terms screens. Carries an `id` so the in-page index can
 * anchor to it. Presentational — server-safe.
 */
export interface LegalSectionProps
  extends React.HTMLAttributes<HTMLElement> {
  /** Section marker, e.g. `§01`. */
  marker?: string;
  /** Section title (Type/Section). */
  title: string;
  /** Prose body — paragraphs, lists, CodeCallouts. */
  children: React.ReactNode;
}

const LegalSection = React.forwardRef<HTMLElement, LegalSectionProps>(
  ({ marker, title, children, className, id, ...props }, ref) => {
    return (
      <section
        ref={ref}
        id={id}
        className={cn("flex max-w-[600px] scroll-mt-24 flex-col gap-3.5", className)}
        {...props}
      >
        <div className="flex items-baseline gap-3">
          {marker ? (
            <span className="font-mono text-[11px] font-bold uppercase tracking-[1.5px] text-muted-foreground-subtle">
              {marker}
            </span>
          ) : null}
          <h2 className="font-sans text-subtitle font-bold text-foreground">
            {title}
          </h2>
        </div>
        <div className="flex flex-col gap-3 text-[14px] leading-relaxed text-muted-foreground">
          {children}
        </div>
      </section>
    );
  },
);
LegalSection.displayName = "LegalSection";

export { LegalSection };
