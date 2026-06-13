import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScopeChip } from "./scope-chip";

const meta = {
  title: "Components/AI Research/ScopeChip",
  component: ScopeChip,
  parameters: { layout: "centered" },
  args: {
    mission: "AfrikaBurn 2026",
  },
} satisfies Meta<typeof ScopeChip>;

export default meta;

type Story = StoryObj<typeof meta>;

// locked — the desktop AUTHORITATIVE rendering (full $primary border, lock glyph,
// SCOPE · MISSION, + the $muted LOCKED tag). Mission is uppercased.
export const Locked: Story = {
  args: { variant: "locked" },
};

// compact — the mobile rendering (left-2px accent on a /12 tint, target glyph,
// SCOPE · {mission} in one $primary label, no LOCKED tag). Mission casing kept.
export const Compact: Story = {
  args: { variant: "compact" },
};

// Both renderings side by side (desktop locked over mobile compact).
export const DesktopAndMobile: Story = {
  render: (args) => (
    <div className="flex flex-col gap-4">
      <ScopeChip {...args} variant="locked" />
      <ScopeChip {...args} variant="compact" />
    </div>
  ),
};
