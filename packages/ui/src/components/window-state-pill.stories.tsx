import type { Meta, StoryObj } from "@storybook/react-vite";
import { WindowStatePill } from "./window-state-pill";

const meta = {
  title: "Components/WindowStatePill",
  component: WindowStatePill,
  parameters: { layout: "centered" },
} satisfies Meta<typeof WindowStatePill>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Canonical 5 window states (showcase RcvKu) ──────────────────────────────

export const Open: Story = {
  args: { state: "open", variant: "bordered", showOpen: true },
};

export const Closing: Story = {
  args: { state: "closing", daysUntil: 5, variant: "tinted" },
};

export const Closed: Story = {
  args: { state: "closed", variant: "tinted" },
};

export const NotYet: Story = {
  args: { state: "not-yet", date: "10 Jun", variant: "tinted" },
};

export const Blocked: Story = {
  args: { state: "blocked", variant: "tinted" },
};

// ── Overloads the screens fold into this pill ───────────────────────────────

/** OPEN collapses to a bare date (no icon, subtle) on the Category cards. */
export const PlainDate: Story = {
  args: { state: "open", date: "15 Mar" },
};

/** closed appends the real-world cliff date; muted grey, never red (§9). */
export const ClosedWithDate: Story = {
  args: { state: "closed", date: "1 May", variant: "tinted" },
};

/** open with a countdown timer ('OPEN · T-{n}d' — mobile). */
export const OpenCountdown: Story = {
  args: { state: "open", daysUntil: 9, variant: "tinted", showOpen: true },
};

/** Aggregate-summary overload (sidebar NavCard chips). */
export const AggregateSummary: Story = {
  args: { state: "open", variant: "tinted", label: "ON TRACK", showOpen: true },
};

// ── Render modes: bordered (showcase) · tinted (filled) · bare (inline) ──────

export const RenderModes: Story = {
  args: { state: "open" },
  render: () => (
    <div className="flex flex-col items-start gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <WindowStatePill state="open" variant="bordered" showOpen />
        <WindowStatePill state="closing" daysUntil={5} variant="bordered" />
        <WindowStatePill state="closed" variant="bordered" />
        <WindowStatePill state="not-yet" variant="bordered" />
        <WindowStatePill state="blocked" variant="bordered" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <WindowStatePill state="open" variant="tinted" showOpen />
        <WindowStatePill state="closing" daysUntil={3} variant="tinted" />
        <WindowStatePill state="closed" variant="tinted" />
        <WindowStatePill state="not-yet" date="10 Jun" variant="tinted" />
        <WindowStatePill state="blocked" variant="tinted" />
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <WindowStatePill state="open" date="15 Mar" variant="bare" />
        <WindowStatePill state="closing" daysUntil={3} variant="bare" />
        <WindowStatePill state="closed" date="1 May" variant="bare" />
        <WindowStatePill state="blocked" variant="bare" />
        <WindowStatePill state="not-yet" date="10 Jun" variant="bare" />
      </div>
    </div>
  ),
};

// ── Full state/overload union ───────────────────────────────────────────────

export const Matrix: Story = {
  args: { state: "open" },
  render: () => (
    <div className="flex max-w-md flex-col items-start gap-2">
      <WindowStatePill state="open" variant="tinted" showOpen />
      <WindowStatePill state="open" daysUntil={9} variant="tinted" showOpen />
      <WindowStatePill state="open" date="15 Mar" />
      <WindowStatePill state="closing" daysUntil={5} variant="tinted" />
      <WindowStatePill state="closing" daysUntil={2} variant="tinted" />
      <WindowStatePill state="closed" variant="tinted" />
      <WindowStatePill state="closed" date="1 May" variant="tinted" />
      <WindowStatePill state="not-yet" date="10 Jun" variant="tinted" />
      <WindowStatePill state="blocked" variant="tinted" />
      <WindowStatePill state="open" variant="tinted" label="ON TRACK" showOpen />
      <WindowStatePill state="closing" variant="tinted" label="2 OPEN · 1 CLOSING" />
    </div>
  ),
};
