import type { Meta, StoryObj } from "@storybook/react-vite";

import { AppHeader } from "./app-header";
import { StatusDot } from "./status-dot";

const meta = {
  title: "Components/AppHeader",
  component: AppHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AppHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Wordmark-only — the Category/Timeline desktop board rendering (no right cluster). */
export const WordmarkOnly: Story = {
  args: {},
};

/** With an operator/sync block in the right slot (Dependencies-style chrome). */
export const WithOperatorBlock: Story = {
  args: {
    right: (
      <span className="flex items-center gap-2 font-mono text-[11px] tracking-[1px] text-muted-foreground">
        <span className="text-muted-foreground-subtle">SOLO OPERATOR</span>
        <StatusDot tone="success" size={6} />
        <span>04 JUN 2026</span>
      </span>
    ),
  },
};

/** A simple SYNCED status pill in the right slot. */
export const WithSyncStatus: Story = {
  args: {
    right: (
      <span className="flex items-center gap-1.5 font-mono text-micro font-medium uppercase tracking-[1.5px] text-muted-foreground">
        <StatusDot tone="success" size={6} />
        SYNCED
      </span>
    ),
  },
};
