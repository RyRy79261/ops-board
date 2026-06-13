import type { Meta, StoryObj } from "@storybook/react-vite";
import { TaskChip } from "./task-chip";

const meta = {
  title: "Components/AI Research/TaskChip",
  component: TaskChip,
  parameters: { layout: "padded" },
  args: {
    name: "Tankwa Land-Use Permit",
    category: "bureaucratic",
    caption: "BUREAUCRATIC · MATCHED IN MISSION",
    confidence: 92,
  },
} satisfies Meta<typeof TaskChip>;

export default meta;

type Story = StoryObj<typeof meta>;

// High-confidence match (≥85% → success).
export const HighConfidence: Story = {
  render: (args) => (
    <div className="max-w-md">
      <TaskChip {...args} />
    </div>
  ),
};

// Mid-confidence (≥50% → warning).
export const MidConfidence: Story = {
  render: () => (
    <div className="max-w-md">
      <TaskChip
        name="Vehicle Pass Permit"
        category="travel"
        caption="TRAVEL · POSSIBLE MATCH"
        confidence={64}
      />
    </div>
  ),
};

// Low-confidence (<50% → muted).
export const LowConfidence: Story = {
  render: () => (
    <div className="max-w-md">
      <TaskChip
        name="Burn Permit · Art Grant"
        category="gear"
        caption="GEAR · LONG SHOT"
        confidence={41}
      />
    </div>
  ),
};

// Without the confidence block.
export const NoConfidence: Story = {
  render: () => (
    <div className="max-w-md">
      <TaskChip
        name="Tankwa Land-Use Permit"
        category="bureaucratic"
        caption="BUREAUCRATIC"
      />
    </div>
  ),
};
