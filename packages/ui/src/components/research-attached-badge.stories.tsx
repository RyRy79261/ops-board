import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResearchAttachedBadge } from "./research-attached-badge";

const meta = {
  title: "Components/AI Research/ResearchAttachedBadge",
  component: ResearchAttachedBadge,
  parameters: { layout: "centered" },
  args: {
    label: "RESEARCHING",
  },
} satisfies Meta<typeof ResearchAttachedBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

// Target Card instance — pulse dot + RESEARCHING, no timer (§2.4 `l3MpUu`).
export const Default: Story = {
  args: {},
};

// Canonical atom — with the trailing pre-formatted elapsed timer.
export const WithElapsed: Story = {
  args: { elapsedLabel: "00:42" },
};

// On the tinted Target Card surface, to show the badge in context.
export const OnTargetCard: Story = {
  render: (args) => (
    <div className="w-[260px] border-l-2 border-l-primary bg-card p-3.5">
      <div className="mb-2 text-[14px] font-bold text-foreground">
        Tankwa land-use permit
      </div>
      <ResearchAttachedBadge {...args} />
    </div>
  ),
  args: {},
};
