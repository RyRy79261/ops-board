import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorLogRow } from "./error-log-row";

const meta = {
  title: "Components/ErrorLogRow",
  component: ErrorLogRow,
  parameters: { layout: "padded" },
  args: { time: "12:04:31", level: "error", message: "Something broke" },
} satisfies Meta<typeof ErrorLogRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Stack: Story = {
  render: () => (
    <div className="max-w-md divide-y divide-border border border-border">
      <ErrorLogRow
        time="12:04:31"
        level="error"
        message="TypeError: cannot read properties of undefined (reading 'id')"
      />
      <ErrorLogRow
        time="12:03:58"
        level="warn"
        message="Slow network: voice request took 4.2s"
      />
      <ErrorLogRow time="12:01:10" level="info" message="Session refreshed" />
    </div>
  ),
};
