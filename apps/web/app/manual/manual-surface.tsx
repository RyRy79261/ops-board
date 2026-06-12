"use client";

import Link from "next/link";
import * as React from "react";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { ManualLiveBlock } from "@opsboard/ui/components/manual-live-block";
import { ManualTOCItem } from "@opsboard/ui/components/manual-toc-item";
import { SectionNavChip } from "@opsboard/ui/components/section-nav-chip";
import { CodeCallout } from "@opsboard/ui/components/code-callout";
import { WindowStatePill } from "@opsboard/ui/components/window-state-pill";
import { StatusBadge } from "@opsboard/ui/components/status-badge";
import {
  StatusCycleButton,
  NEXT_STATUS,
  type StatusCycleStatus,
} from "@opsboard/ui/components/status-cycle-button";

// In-app Manual. PLACEHOLDER COPY — structure final, words are drafts. A desktop
// TOC (ManualTOCItem, scroll-spy active) + mobile chips (SectionNavChip) over
// sections whose ManualLiveBlocks INSTANCE real components, so the docs show the
// live thing. Client-only for the scroll-spy + the interactive status demo.

const SECTIONS = [
  { id: "getting-started", label: "Getting started" },
  { id: "window-states", label: "Window states" },
  { id: "status", label: "Status" },
  { id: "voice", label: "Voice commands" },
] as const;

export function ManualSurface() {
  const [active, setActive] = React.useState<string>(SECTIONS[0].id);
  const [demoStatus, setDemoStatus] =
    React.useState<StatusCycleStatus>("not-started");

  // Scroll-spy: mark the top-most visible section as active for the TOC.
  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -70% 0px" },
    );
    for (const s of SECTIONS) {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, []);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">
              <ArrowLeft aria-hidden="true" /> Settings
            </Link>
          </Button>
        }
      />

      {/* Mobile scroll-nav chips. */}
      <nav className="flex gap-2 overflow-x-auto border-b border-border bg-muted px-4 py-3 md:hidden">
        {SECTIONS.map((s) => (
          <SectionNavChip
            key={s.id}
            label={s.label}
            active={active === s.id}
            onClick={() =>
              document
                .getElementById(s.id)
                ?.scrollIntoView({ behavior: "smooth", block: "start" })
            }
          />
        ))}
      </nav>

      <div className="mx-auto flex w-full max-w-4xl flex-1 gap-10 p-6">
        {/* Desktop TOC. */}
        <nav className="sticky top-24 hidden h-fit shrink-0 flex-col md:flex">
          {SECTIONS.map((s) => (
            <Link key={s.id} href={`#${s.id}`} className="outline-none">
              <ManualTOCItem label={s.label} active={active === s.id} />
            </Link>
          ))}
        </nav>

        <article className="flex min-w-0 flex-1 flex-col gap-10">
          <header className="flex flex-col gap-2">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              Manual
            </Eyebrow>
            <p className="text-label text-muted-foreground">
              How OpsBoard works. Draft copy — the structure is final.
            </p>
          </header>

          <Section id="getting-started" title="Getting started">
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              OpsBoard is a voice-first mission planner. You create missions and
              tasks by speaking; the board is a read-only status display. The only
              direct interaction is tapping a task to cycle its status.
            </p>
          </Section>

          <Section id="window-states" title="Window states">
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Tasks carry a <em>too-late-by</em> cliff, not a due date. The board
              shows the window state — never “overdue”.
            </p>
            <ManualLiveBlock label="Window states">
              <div className="flex flex-wrap gap-2">
                <WindowStatePill state="open" date="27 APR 2026" />
                <WindowStatePill state="closing" daysUntil={3} />
                <WindowStatePill state="closed" />
                <WindowStatePill state="not-yet" />
                <WindowStatePill state="blocked" />
              </div>
            </ManualLiveBlock>
          </Section>

          <Section id="status" title="Status">
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Tap the status box to cycle a task: not-started → in-progress →
              done. Try the live one below.
            </p>
            <ManualLiveBlock label="Status — tap to cycle">
              <div className="flex items-center gap-4">
                <StatusCycleButton
                  status={demoStatus}
                  onCycle={() =>
                    setDemoStatus((s) => NEXT_STATUS[s])
                  }
                />
                <StatusBadge status={demoStatus} />
              </div>
            </ManualLiveBlock>
          </Section>

          <Section id="voice" title="Voice commands">
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              Hold the mic and speak. OpsBoard transcribes, parses the intent, and
              confirms before anything destructive.
            </p>
            <ManualLiveBlock label="Example">
              <CodeCallout mono>
                {`# say
"create a mission called Book the trip"
→ Mission created ✓

# say
"add a task renew passport, too late by April 27"
→ Task added to Book the trip ✓`}
              </CodeCallout>
            </ManualLiveBlock>
          </Section>
        </article>
      </div>
    </div>
  );
}

function Section({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="flex scroll-mt-24 flex-col gap-4">
      <h2 className="font-sans text-subtitle font-bold text-foreground">
        {title}
      </h2>
      {children}
    </section>
  );
}
