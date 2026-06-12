import type { Meta, StoryObj } from "@storybook/react-vite";
import { DisambiguationPicker } from "./disambiguation-picker";

const meta = {
  title: "Components/AI Research/DisambiguationPicker",
  component: DisambiguationPicker,
  parameters: { layout: "centered" },
  args: {
    prompt: '2 TASKS MATCH "permit" — PICK ONE',
    onPick: (id: string) => console.log("pick", id),
    candidates: [
      {
        id: "tankwa",
        name: "Tankwa Land-Use Permit",
        category: "bureaucratic",
        caption: "BUREAUCRATIC",
        confidence: 92,
        selected: true,
      },
      {
        id: "vehicle",
        name: "Vehicle Pass Permit",
        category: "travel",
        caption: "TRAVEL",
        confidence: 64,
      },
      {
        id: "burn",
        name: "Burn Permit · Art Grant",
        category: "gear",
        caption: "GEAR",
        confidence: 41,
      },
    ],
  },
} satisfies Meta<typeof DisambiguationPicker>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop panel (authoritative): 3 candidates, banded confidence (success /
// warning / muted), top match carries the $primary border.
export const Panel: Story = {
  args: { variant: "panel" },
};

// Mobile screen: 2 tappable cards with chevron affordance, neutral muted
// confidence pills (no banding), and a SAY IT AGAIN retry row.
export const Screen: Story = {
  args: {
    variant: "screen",
    prompt:
      '2 tasks match "permit" in this mission. Pick the one to attach research to:',
    onRetry: () => console.log("retry"),
    candidates: [
      {
        id: "submit",
        name: "Submit Tankwa land-use permit",
        category: "bureaucratic",
        caption: "BUREAUCRATIC",
        confidence: 88,
      },
      {
        id: "fire",
        name: "Get fire-performance permit",
        category: "bureaucratic",
        caption: "BUREAUCRATIC",
        confidence: 64,
      },
    ],
  },
};

// Mobile screen without the optional retry row.
export const ScreenNoRetry: Story = {
  args: {
    ...Screen.args,
    onRetry: undefined,
  },
};
