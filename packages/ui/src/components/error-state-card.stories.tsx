import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  SearchX,
  BadgeAlert,
  GitFork,
  WifiOff,
  TimerOff,
  Hourglass,
  CircleAlert,
  MicOff,
  Mic,
  PencilLine,
  Check,
  RotateCw,
  Timer,
  Loader,
  Keyboard,
} from "lucide-react";

import { ErrorStateCard } from "./error-state-card";
import { SourceRow } from "./source-row";

const meta = {
  title: "Components/ErrorStateCard",
  component: ErrorStateCard,
  parameters: { layout: "centered" },
  args: {
    body: "Couldn’t find anything matching that. Try rephrasing the command.",
  },
} satisfies Meta<typeof ErrorStateCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Canonical advisory (stripe layout, neutral) — header + body, no action.
export const NoResults: Story = {
  args: {},
};

// Legacy single voice-retry action button (stripe layout).
export const WithRetry: Story = {
  args: { actionLabel: "Say it again" },
};

// The full desktop "Errors & Edge States" catalog — all 8 cells (top-accent
// layout), spec copy/icons/severity. (The LOW CONFIDENCE "Confirm" CTA uses the
// primary action fill; the component has no warning-fill action variant — the
// only catalog divergence.) AMBIGUOUS + LOW CONFIDENCE are catalog-only here —
// the live flow routes ambiguity to the DisambiguationPicker.
export const DesktopCatalog: Story = {
  args: { body: "" },
  parameters: { layout: "padded" },
  render: () => (
    <div className="grid w-[860px] max-w-full grid-cols-2 gap-5">
      <ErrorStateCard
        layout="top-accent"
        tone="neutral"
        icon={SearchX}
        header="NO RESULTS FOUND"
        body="Couldn’t find reliable steps. Try rephrasing or narrowing the request."
        actions={[
          { label: "Say it again", variant: "primary", icon: Mic },
          { label: "Rephrase", variant: "outline", icon: PencilLine },
        ]}
      />
      <ErrorStateCard
        layout="top-accent"
        tone="warning"
        icon={BadgeAlert}
        header="NEEDS CONFIRMATION"
        body="I’m not fully sure this is the task you meant. Confirm before I apply these steps."
        actions={[
          { label: "Confirm", variant: "primary", icon: Check },
          { label: "Cancel", variant: "outline" },
        ]}
      >
        <div className="flex items-center gap-2 border border-border bg-card-elevated px-3 py-2.5">
          <span className="flex-1 text-[12px] text-foreground">
            Renew passport — courier collection
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
            BUREAU
          </span>
        </div>
      </ErrorStateCard>
      <ErrorStateCard
        layout="top-accent"
        tone="primary"
        icon={GitFork}
        header="WHICH TASK DID YOU MEAN?"
        body="More than one task matches your request. Tap the one you meant."
      >
        <div className="flex flex-col gap-2">
          {[
            ["Book travel clinic — yellow fever", "MED"],
            ["Book courier — passport pickup", "BUREAU"],
            ["Book campsite — Tankwa gates", "TRAVEL"],
          ].map(([name, tag]) => (
            <div
              key={name}
              className="flex items-center gap-2 border border-border bg-card-elevated px-3 py-2.5"
            >
              <span className="flex-1 text-[12px] text-foreground">{name}</span>
              <span className="font-mono text-[10px] uppercase tracking-[1px] text-muted-foreground">
                {tag}
              </span>
            </div>
          ))}
        </div>
      </ErrorStateCard>
      <ErrorStateCard
        layout="top-accent"
        tone="destructive"
        icon={WifiOff}
        header="CONNECTION ERROR"
        body="Couldn’t reach the research service. Check your connection and try again."
        meta="OFFLINE · LAST SYNC 2M AGO"
        actions={[
          { label: "Retry", variant: "primary", icon: RotateCw },
          { label: "Dismiss", variant: "outline" },
        ]}
      />
      <ErrorStateCard
        layout="top-accent"
        tone="warning"
        icon={TimerOff}
        header="RATE LIMITED"
        body="Too many requests — try again in a few minutes. Your place in line is saved."
        meta="RETRY AVAILABLE IN 3:00"
        actions={[
          {
            label: "Retry in 3:00",
            variant: "outline",
            icon: Timer,
            disabled: true,
          },
          { label: "Dismiss", variant: "outline" },
        ]}
      />
      <ErrorStateCard
        layout="top-accent"
        tone="warning"
        icon={Hourglass}
        header="TAKING LONGER THAN EXPECTED"
        body="This is still running. Keep it going in the background, or come back later — we’ll notify you when it’s done."
        actions={[
          { label: "Keep running", variant: "primary", icon: Loader },
          { label: "Come back later", variant: "outline", icon: Timer },
        ]}
      />
      {/* FORWARD-LOOKING: the runner only ever reaches `complete` | `error`, so
          there is no live data path that produces PARTIAL RESULTS yet (it would
          need per-source failure tracking + a `partial` job state). The card +
          SourceRow `status="failed"` support it for when that lands. */}
      <ErrorStateCard
        layout="top-accent"
        tone="warning"
        icon={CircleAlert}
        header="PARTIAL RESULTS"
        body="Added 3 notes — 2 sources were unreachable. You can retry the ones that failed."
        actions={[
          { label: "Retry failed sources", variant: "primary", icon: RotateCw },
          { label: "View notes", variant: "outline" },
        ]}
      >
        <div className="border border-border bg-card-elevated">
          <SourceRow status="failed" domain="dha.gov.za" />
          <SourceRow status="failed" domain="sars.gov.za" divider />
        </div>
      </ErrorStateCard>
      <ErrorStateCard
        layout="top-accent"
        tone="destructive"
        icon={MicOff}
        header="MICROPHONE BLOCKED"
        body="Voice capture failed. Allow microphone access to dictate your request."
        actions={[
          { label: "Allow microphone access", variant: "primary", icon: Mic },
        ]}
      >
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground-subtle">
          <Keyboard aria-hidden="true" className="size-3" /> or type your
          request instead
        </span>
      </ErrorStateCard>
    </div>
  ),
};
