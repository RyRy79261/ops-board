import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusDot } from "./status-dot";

const meta = {
  title: "Components/StatusDot",
  component: StatusDot,
  parameters: { layout: "centered" },
} satisfies Meta<typeof StatusDot>;

export default meta;

type Story = StoryObj<typeof meta>;

/** accent · base — 8×8 $primary group-header dot (canonical). */
export const Default: Story = {
  args: { tone: "accent", size: 8 },
};

/** The 5 category hues (medical / bureaucratic / travel / gear / tech), 8×8. */
export const Categories: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot tone="cat-medical" />
      <StatusDot tone="cat-bureaucratic" />
      <StatusDot tone="cat-travel" />
      <StatusDot tone="cat-gear" />
      <StatusDot tone="cat-tech" />
    </div>
  ),
};

/** Status tones — success (live/sync/done) · warning · muted (inactive). */
export const StatusTones: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot tone="success" />
      <StatusDot tone="warning" />
      <StatusDot tone="muted" />
    </div>
  ),
};

/** The three sizes: 6px (sync/meta) · 7px (inline CategoryTag) · 8px (headers). */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <StatusDot tone="accent" size={6} />
      <StatusDot tone="accent" size={7} />
      <StatusDot tone="accent" size={8} />
    </div>
  ),
};

/** Decorative dots are always paired with a label (LOCKED #6 — color never alone). */
export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2 font-mono text-eyebrow uppercase tracking-[0.125em] text-muted-foreground">
      <StatusDot tone="success" size={6} />
      <span>SYNCED</span>
    </div>
  ),
};

const TONES = [
  "accent",
  "cat-medical",
  "cat-bureaucratic",
  "cat-travel",
  "cat-gear",
  "cat-tech",
  "success",
  "warning",
  "muted",
] as const;

const SIZES = [6, 7, 8] as const;

/** Full tone × size matrix. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      {TONES.map((tone) => (
        <div key={tone} className="flex items-center gap-4">
          <span className="w-36 font-mono text-mono-caption text-muted-foreground">
            {tone}
          </span>
          {SIZES.map((size) => (
            <StatusDot key={size} tone={tone} size={size} />
          ))}
        </div>
      ))}
    </div>
  ),
};
