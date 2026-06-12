import * as React from "react";
import {
  Backpack,
  CircleCheck,
  Cpu,
  FilePlus,
  FileText,
  Globe,
  Plane,
  ScanSearch,
  Sparkles,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { IntentRow } from "./intent-row";
import { TaskChip } from "./task-chip";

/**
 * ParsedIntentPanel — the agent's structured understanding of the voice command
 * (`03-surfaces/ai-research.md`, desktop B.2.3 left column `MFY8j` + mobile
 * C.2.3 `NpGtk`). It COMPOSES the AI Research leaves (IntentRow / TaskChip /
 * Badge) into a four-slot definition list: INTENT · QUERY · TARGET TASK · ACTION.
 *
 * Desktop: `$card` body inside a 2px `$primary` LEFT accent wrapper, a
 * `scan-search` / `PARSED INTENT` header with an `AGENT UNDERSTANDING` sub-label,
 * then four IntentRows (bottom hairline on all but the trailing ACTION). INTENT
 * is the muted globe `RESEARCH` pill; QUERY is mono text in curly quotes; TARGET
 * TASK is a TaskChip with the confidence block; ACTION is a `file-plus` + label.
 *
 * Mobile (`variant="mobile"`): a bordered `$card` with an `AGENT UNDERSTANDS` /
 * `sparkles` header and four BORDERLESS gap-4 stacks (no dividers). INTENT/ACTION
 * collapse to plain text; TARGET TASK shows the task name over two rounded-full
 * pill chips (category + `{n}% MATCH`).
 *
 * Presentational leaf (no state) → server-safe, no "use client". Live values
 * (confidence) arrive as props; the panel never computes them.
 */
type Category = "medical" | "bureaucratic" | "travel" | "gear" | "tech";

/** Per-category mobile chip meta: Lucide glyph + tint/text token classes. */
const CATEGORY_CHIP: Record<
  Category,
  { icon: LucideIcon; label: string; chip: string }
> = {
  medical: {
    icon: Stethoscope,
    label: "MEDICAL",
    chip: "bg-cat-medical/12 text-cat-medical",
  },
  bureaucratic: {
    icon: FileText,
    label: "BUREAUCRATIC",
    chip: "bg-cat-bureaucratic/12 text-cat-bureaucratic",
  },
  travel: { icon: Plane, label: "TRAVEL", chip: "bg-cat-travel/12 text-cat-travel" },
  gear: { icon: Backpack, label: "GEAR", chip: "bg-cat-gear/12 text-cat-gear" },
  tech: { icon: Cpu, label: "TECH", chip: "bg-cat-tech/12 text-cat-tech" },
};

export interface ParsedIntentPanelProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Resolved intent verb (e.g. `RESEARCH`). */
  intentLabel: string;
  /** The normalised search query (rendered mono + curly-quoted on desktop). */
  query: string;
  /** The matched task slot — drives the TARGET TASK chip. */
  target: {
    name: string;
    category: Category;
    /** Mono caption under the name (desktop TaskChip only). */
    caption?: string;
    /** Match confidence 0–100; drives the desktop % block + mobile MATCH chip. */
    confidence?: number;
  };
  /** The resolved action sentence (e.g. `Append research notes to this task`). */
  action: string;
  /** Desktop accent-wrapped panel vs. mobile bordered stacks. */
  variant?: "desktop" | "mobile";
}

const ParsedIntentPanel = React.forwardRef<
  HTMLDivElement,
  ParsedIntentPanelProps
>(
  (
    {
      intentLabel,
      query,
      target,
      action,
      variant = "desktop",
      className,
      ...props
    },
    ref,
  ) => {
    if (variant === "mobile") {
      const cat = CATEGORY_CHIP[target.category];
      const CatIcon = cat.icon;
      return (
        <div
          ref={ref}
          className={cn(
            "flex flex-col gap-[13px] border border-border bg-card p-3.5",
            className,
          )}
          {...props}
        >
          <div className="flex items-center gap-[7px]">
            <Sparkles aria-hidden="true" className="size-3.5 text-primary" />
            <span className="font-mono text-[10px] font-bold uppercase tracking-[1.5px] text-primary">
              Agent Understands
            </span>
          </div>

          <div className="flex flex-col gap-4">
            {/* INTENT — plain text, no pill */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground-subtle">
                Intent
              </span>
              <span className="font-mono text-[13px] font-bold tracking-[1px] text-foreground">
                {intentLabel}
              </span>
            </div>

            {/* QUERY — DM Sans, no surrounding quotes */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground-subtle">
                Query
              </span>
              <span className="text-[14px] font-medium text-foreground">
                {query}
              </span>
            </div>

            {/* TARGET TASK — name + two pill chips */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground-subtle">
                Target Task
              </span>
              <span className="text-[15px] font-semibold text-foreground">
                {target.name}
              </span>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.5px]",
                    cat.chip,
                  )}
                >
                  <CatIcon aria-hidden="true" className="size-[11px] shrink-0" />
                  {cat.label}
                </span>
                {target.confidence != null ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-success/12 px-2 py-[3px] font-mono text-[10px] font-bold uppercase tracking-[0.5px] text-success">
                    <CircleCheck
                      aria-hidden="true"
                      className="size-[11px] shrink-0"
                    />
                    {target.confidence}% Match
                  </span>
                ) : null}
              </div>
            </div>

            {/* ACTION — plain text, no icon */}
            <div className="flex flex-col gap-1">
              <span className="font-mono text-[9px] font-semibold uppercase tracking-[1.5px] text-muted-foreground-subtle">
                Action
              </span>
              <span className="text-[14px] font-medium text-foreground">
                {action}
              </span>
            </div>
          </div>
        </div>
      );
    }

    // Desktop: 2px $primary LEFT accent wrapping a $card body.
    return (
      <div
        ref={ref}
        className={cn(
          "border-l-2 border-l-primary bg-card px-[18px] py-[18px]",
          className,
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-[9px]">
            <ScanSearch aria-hidden="true" className="size-[15px] text-primary" />
            <span className="font-mono text-[12px] uppercase tracking-[1.5px] text-foreground">
              Parsed Intent
            </span>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[1.5px] text-muted-foreground-subtle">
            Agent Understanding
          </span>
        </div>

        <div className="flex flex-col">
          <IntentRow label="Intent" divider>
            <Badge variant="intent" icon={Globe}>
              {intentLabel}
            </Badge>
          </IntentRow>

          <IntentRow label="Query" divider>
            <span className="font-mono text-[14px] leading-relaxed text-foreground">
              {`“${query}”`}
            </span>
          </IntentRow>

          <IntentRow label="Target Task" divider>
            <TaskChip
              name={target.name}
              category={target.category}
              caption={target.caption}
              confidence={target.confidence}
            />
          </IntentRow>

          <IntentRow label="Action">
            <span className="flex items-center gap-[9px]">
              <FilePlus
                aria-hidden="true"
                className="size-3.5 shrink-0 text-primary"
              />
              <span className="text-[14px] text-foreground">{action}</span>
            </span>
          </IntentRow>
        </div>
      </div>
    );
  },
);
ParsedIntentPanel.displayName = "ParsedIntentPanel";

export { ParsedIntentPanel };
