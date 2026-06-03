import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatTile } from "./stat-tile";

const meta = {
  title: "Components/StatTile",
  component: StatTile,
  parameters: { layout: "centered" },
  args: { value: 3, label: "DONE" },
} satisfies Meta<typeof StatTile>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Tone variants (the 4 mission metrics) ──────────────────────────────────

export const Done: Story = {
  args: { value: 3, label: "DONE", tone: "success" },
};

export const Blocked: Story = {
  args: { value: 3, label: "BLOCKED", tone: "destructive" },
};

export const Closing: Story = {
  args: { value: 2, label: "CLOSING", tone: "warning" },
};

export const Total: Story = {
  args: { value: 11, label: "TOTAL", tone: "foreground" },
};

/** Mobile softens BLOCKED off red → muted (no-panic-red). */
export const BlockedMuted: Story = {
  args: { value: 3, label: "BLOCKED", tone: "muted", size: "mobile" },
};

// ── The 4-stat cluster (DONE · BLOCKED · CLOSING · TOTAL) ───────────────────

export const StatCluster: Story = {
  render: () => (
    <div className="flex gap-5 bg-card p-4">
      <StatTile value={3} label="DONE" tone="success" />
      <StatTile value={3} label="BLOCKED" tone="destructive" />
      <StatTile value={2} label="CLOSING" tone="warning" />
      <StatTile value={11} label="TOTAL" tone="foreground" />
    </div>
  ),
};

// ── Size scale (showcase 30 / detail 22 / summary 20 / mobile 13) ───────────

export const Sizes: Story = {
  render: () => (
    <div className="flex items-end gap-8 bg-card p-4">
      <StatTile value={11} label="SHOWCASE" tone="foreground" size="showcase" />
      <StatTile value={11} label="DETAIL" tone="foreground" size="detail" />
      <StatTile value={11} label="SUMMARY" tone="foreground" size="summary" />
      <StatTile value={11} label="MOBILE" tone="foreground" size="mobile" />
    </div>
  ),
};

// ── Full matrix: every tone × every size ────────────────────────────────────

const TONES = [
  { tone: "success", label: "DONE", value: 3 },
  { tone: "destructive", label: "BLOCKED", value: 3 },
  { tone: "warning", label: "CLOSING", value: 2 },
  { tone: "foreground", label: "TOTAL", value: 11 },
] as const;

const SIZES = ["showcase", "detail", "summary", "mobile"] as const;

export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 bg-card p-4">
      {SIZES.map((size) => (
        <div key={size} className="flex items-end gap-6">
          {TONES.map(({ tone, label, value }) => (
            <StatTile
              key={`${size}-${label}`}
              value={value}
              label={label}
              tone={tone}
              size={size}
            />
          ))}
        </div>
      ))}
    </div>
  ),
};
