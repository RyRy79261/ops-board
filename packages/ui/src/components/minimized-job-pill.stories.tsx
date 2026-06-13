import type { Meta, StoryObj } from "@storybook/react-vite";
import { MinimizedJobPill } from "./minimized-job-pill";

const meta = {
  title: "Components/AI Research/MinimizedJobPill",
  component: MinimizedJobPill,
  parameters: { layout: "centered" },
  args: {
    taskName: "Researching permit steps",
    elapsedLabel: "00:42",
    variant: "docked",
  },
} satisfies Meta<typeof MinimizedJobPill>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop §2.5 `qogkb` — the rounded-full + shadowed docked pill (the board's
// single --radius:0 exception), with the Expand chevron.
export const Docked: Story = {};

// Mobile §3.2(e) `C8uAS` — sharp, shadowless, $card-elevated fill; no separator
// dot and no Expand chevron.
export const Inline: Story = {
  args: { variant: "inline" },
};

// Both renderings side by side for the variant contrast.
export const Variants: Story = {
  render: (args) => (
    <div className="flex flex-col items-start gap-6">
      <MinimizedJobPill {...args} variant="docked" />
      <MinimizedJobPill {...args} variant="inline" />
    </div>
  ),
};
