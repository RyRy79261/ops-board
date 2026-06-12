import type { Meta, StoryObj } from "@storybook/react-vite";
import { SectionNavChip } from "./section-nav-chip";

const meta = {
  title: "Components/SectionNavChip",
  component: SectionNavChip,
  parameters: { layout: "padded" },
  args: { label: "Status" },
} satisfies Meta<typeof SectionNavChip>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Row: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <SectionNavChip label="Getting started" active />
      <SectionNavChip label="Window states" />
      <SectionNavChip label="Voice commands" />
    </div>
  ),
};
