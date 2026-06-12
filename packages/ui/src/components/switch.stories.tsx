import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./switch";

const meta = {
  title: "Components/Switch",
  component: Switch,
  parameters: { layout: "centered" },
  args: { shape: "square" },
} satisfies Meta<typeof Switch>;

export default meta;

type Story = StoryObj<typeof meta>;

// square · off — the Settings default.
export const Off: Story = {
  args: { defaultChecked: false },
};

// square · on — $primary track + $primary-foreground knob.
export const On: Story = {
  args: { defaultChecked: true },
};

// pill shape — the Report/Shake variant.
export const Pill: Story = {
  args: { shape: "pill", defaultChecked: true },
};

// disabled.
export const Disabled: Story = {
  args: { defaultChecked: true, disabled: true },
};
