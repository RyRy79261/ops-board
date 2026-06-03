import type { Meta, StoryObj } from "@storybook/react-vite";

import { DependencyConnector } from "./dependency-connector";

const meta = {
  title: "Components/DependencyConnector",
  component: DependencyConnector,
  parameters: { layout: "padded" },
  args: { variant: "default" },
} satisfies Meta<typeof DependencyConnector>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Neutral connector — muted-subtle ↳ glyph for a non-critical dependent. */
export const Default: Story = {
  args: { variant: "default" },
};

/** Critical-path connector — $primary ↳ glyph (keyed by the CRITICAL PATH legend). */
export const Critical: Story = {
  args: { variant: "critical" },
};

/** Both variants side by side. */
export const Both: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <DependencyConnector variant="default" />
      <DependencyConnector variant="critical" />
    </div>
  ),
};
