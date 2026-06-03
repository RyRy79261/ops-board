import type { Meta, StoryObj } from "@storybook/react-vite";

import { UnlinkedGroupHeader } from "./unlinked-group-header";

const meta = {
  title: "Components/UnlinkedGroupHeader",
  component: UnlinkedGroupHeader,
  parameters: { layout: "padded" },
  args: { count: 2 },
} satisfies Meta<typeof UnlinkedGroupHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The board's case: 2 tasks with no dependency edges. */
export const TwoTasks: Story = {
  args: { count: 2 },
};

/** Single unlinked task — count suffix singularizes to "1 TASK". */
export const OneTask: Story = {
  args: { count: 1 },
};
