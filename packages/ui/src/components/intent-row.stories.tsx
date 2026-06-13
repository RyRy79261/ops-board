import type { Meta, StoryObj } from "@storybook/react-vite";
import { IntentRow } from "./intent-row";
import { Badge } from "./badge";

const meta = {
  title: "Components/AI Research/IntentRow",
  component: IntentRow,
  parameters: { layout: "padded" },
  args: { label: "QUERY" },
} satisfies Meta<typeof IntentRow>;

export default meta;

type Story = StoryObj<typeof meta>;

// A plain-text value row (QUERY).
export const Text: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <IntentRow {...args}>
        <span className="font-mono text-[14px] text-foreground">
          “How to submit the Tankwa Karoo land-use permit”
        </span>
      </IntentRow>
    </div>
  ),
};

// A pill value row (INTENT) with a divider beneath.
export const WithPill: Story = {
  render: () => (
    <div className="max-w-xl">
      <IntentRow label="INTENT" divider>
        <Badge variant="intent">Research</Badge>
      </IntentRow>
      <IntentRow label="ACTION">
        <span className="text-[14px] text-foreground">
          Append research notes to this task
        </span>
      </IntentRow>
    </div>
  ),
};
