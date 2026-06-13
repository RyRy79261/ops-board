import type { Meta, StoryObj } from "@storybook/react-vite";
import { ParsedIntentPanel } from "./parsed-intent-panel";

const meta = {
  title: "Components/AI Research/ParsedIntentPanel",
  component: ParsedIntentPanel,
  parameters: { layout: "padded" },
  args: {
    intentLabel: "RESEARCH",
    query: "How to submit the Tankwa Karoo land-use permit",
    target: {
      name: "Tankwa Land-Use Permit",
      category: "bureaucratic",
      caption: "BUREAUCRATIC · MATCHED IN MISSION",
      confidence: 92,
    },
    action: "Append research notes to this task",
    variant: "desktop",
  },
} satisfies Meta<typeof ParsedIntentPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop — the canonical B.2.3 left column: accent wrapper + 4 IntentRows.
export const Desktop: Story = {
  render: (args) => (
    <div className="max-w-xl">
      <ParsedIntentPanel {...args} />
    </div>
  ),
};

// Mobile C.2.3 — bordered card, borderless stacks, pill chips for the target.
export const Mobile: Story = {
  args: {
    variant: "mobile",
    query: "How to submit the Tankwa Karoo land-use permit",
    target: {
      name: "Submit Tankwa land-use permit",
      category: "bureaucratic",
      confidence: 92,
    },
  },
  render: (args) => (
    <div className="w-[354px]">
      <ParsedIntentPanel {...args} />
    </div>
  ),
};

// A different category + mid-band confidence (drives the TaskChip % tone).
export const MidConfidenceTravel: Story = {
  args: {
    query: "Vehicle pass renewal requirements for the gate",
    target: {
      name: "Vehicle Pass Permit",
      category: "travel",
      caption: "TRAVEL · POSSIBLE MATCH",
      confidence: 64,
    },
    action: "Append research notes to this task",
  },
  render: (args) => (
    <div className="max-w-xl">
      <ParsedIntentPanel {...args} />
    </div>
  ),
};

// Desktop + mobile rendered side by side for parity review.
export const DesktopAndMobile: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="w-[520px]">
        <ParsedIntentPanel {...args} variant="desktop" />
      </div>
      <div className="w-[354px]">
        <ParsedIntentPanel
          {...args}
          variant="mobile"
          target={{
            name: "Submit Tankwa land-use permit",
            category: "bureaucratic",
            confidence: 92,
          }}
        />
      </div>
    </div>
  ),
};
