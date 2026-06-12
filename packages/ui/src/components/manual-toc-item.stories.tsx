import type { Meta, StoryObj } from "@storybook/react-vite";
import { ManualTOCItem } from "./manual-toc-item";

const meta = {
  title: "Components/ManualTOCItem",
  component: ManualTOCItem,
  parameters: { layout: "padded" },
  args: { label: "Window states" },
} satisfies Meta<typeof ManualTOCItem>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stack: Story = {
  render: () => (
    <div className="flex flex-col">
      <ManualTOCItem label="Getting started" />
      <ManualTOCItem label="Window states" active />
      <ManualTOCItem label="Voice commands" />
    </div>
  ),
};
