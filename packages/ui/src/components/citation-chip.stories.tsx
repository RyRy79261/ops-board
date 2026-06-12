import type { Meta, StoryObj } from "@storybook/react-vite";
import { CitationChip } from "./citation-chip";

const meta = {
  title: "Components/AI Research/CitationChip",
  component: CitationChip,
  parameters: { layout: "centered" },
  args: { index: 1 },
} satisfies Meta<typeof CitationChip>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop — a discrete bordered chip.
export const Chip: Story = {
  args: { renderMode: "chip" },
};

// Mobile — bracketed text appended inline to a step.
export const Inline: Story = {
  render: (args) => (
    <p className="max-w-sm text-[14px] leading-relaxed text-foreground">
      Submit the completed land-use application to the regional office.{" "}
      <CitationChip {...args} renderMode="inline" />
    </p>
  ),
};

// A row of citations as they appear under a step.
export const Row: Story = {
  render: () => (
    <div className="flex items-center gap-1.5">
      <CitationChip index={1} />
      <CitationChip index={2} />
      <CitationChip index={3} />
    </div>
  ),
};
