import type { Meta, StoryObj } from "@storybook/react-vite";
import { ManualLiveBlock } from "./manual-live-block";
import { WindowStatePill } from "./window-state-pill";

const meta = {
  title: "Components/ManualLiveBlock",
  component: ManualLiveBlock,
  parameters: { layout: "padded" },
  args: { label: "Live demo", children: null },
} satisfies Meta<typeof ManualLiveBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ManualLiveBlock label="Window states">
      <div className="flex flex-wrap gap-2">
        <WindowStatePill state="open" date="27 APR 2026" />
        <WindowStatePill state="closing" daysUntil={3} />
        <WindowStatePill state="closed" />
      </div>
    </ManualLiveBlock>
  ),
};
