import type { Meta, StoryObj } from "@storybook/react-vite";
import { DebugInfoRow } from "./debug-info-row";

const meta = {
  title: "Components/DebugInfoRow",
  component: DebugInfoRow,
  parameters: { layout: "padded" },
  args: { label: "Build", value: "2026.06.12" },
} satisfies Meta<typeof DebugInfoRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stack: Story = {
  render: () => (
    <div className="max-w-sm">
      <DebugInfoRow label="Build" value="2026.06.12" />
      <DebugInfoRow label="Env" value="production" />
      <DebugInfoRow label="Timezone" value="Africa/Johannesburg" />
      <DebugInfoRow label="User" value="ryan@example.com" />
    </div>
  ),
};
