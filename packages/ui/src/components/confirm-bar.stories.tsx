import type { Meta, StoryObj } from "@storybook/react-vite";
import { ConfirmBar } from "./confirm-bar";

const meta = {
  title: "Components/AI Research/ConfirmBar",
  component: ConfirmBar,
  parameters: { layout: "padded" },
  args: {
    onConfirm: () => {},
    onCancel: () => {},
    hint: "Phrasing can be strict & terse — the mission scope plus the agent resolve the rest.",
    variant: "bar",
  },
} satisfies Meta<typeof ConfirmBar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop B.2.4 — the horizontal $muted bar with the info hint + CANCEL + CTA.
export const Bar: Story = {};

// Desktop bar with no hint — buttons stay right-aligned via the space-between.
export const BarNoHint: Story = {
  args: { hint: undefined },
};

// Mobile C.2.4 — the vertical CTA group (search icon, ghost cancel, subtle hint).
export const Stacked: Story = {
  args: {
    variant: "stacked",
    hint: "Phrasing can be terse — the mission scope + agent resolve the rest.",
  },
  parameters: { layout: "centered" },
  render: (args) => (
    <div className="w-[354px]">
      <ConfirmBar {...args} />
    </div>
  ),
};

// Custom copy still flows through both renderings.
export const CustomLabels: Story = {
  args: {
    confirmLabel: "RUN AGENT",
    cancelLabel: "DISCARD",
    hint: "This will append research notes to the matched task.",
  },
};
