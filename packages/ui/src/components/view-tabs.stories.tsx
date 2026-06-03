import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { ViewTabs, type ViewTabValue } from "./view-tabs";

const meta = {
  title: "Components/ViewTabs",
  component: ViewTabs,
  parameters: { layout: "padded" },
  argTypes: {
    value: {
      control: "inline-radio",
      options: ["category", "timeline", "dependencies"],
    },
  },
  args: { value: "category", onValueChange: () => {} },
} satisfies Meta<typeof ViewTabs>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Active = BY CATEGORY (Category board, canonical showcase rendering). */
export const Category: Story = { args: { value: "category" } };

/** Active = TIMELINE (Timeline board). */
export const Timeline: Story = { args: { value: "timeline" } };

/** Active = DEPENDENCIES (Dependencies board). */
export const Dependencies: Story = { args: { value: "dependencies" } };

/** Controlled switch — click a tab or use ←/→ Home/End to rove + select. */
function Controlled() {
  const [value, setValue] = React.useState<ViewTabValue>("category");
  return (
    <div className="flex flex-col gap-6">
      <ViewTabs value={value} onValueChange={setValue} />
      <p className="px-8 font-mono text-mono-caption text-muted-foreground">
        active view: <span className="text-primary">{value}</span>
      </p>
    </div>
  );
}

/** Live controlled bar; the active underline + label track the selection. */
export const Interactive: Story = {
  render: () => <Controlled />,
};

/**
 * Per-tab states from the contract — active (primary label + 2px primary
 * underline) vs inactive (muted label, no underline) vs hover (label lifts to
 * foreground). Hover the inactive tabs; tab into the bar to see the focus ring.
 */
export const States: Story = {
  render: () => (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <span className="font-mono text-micro uppercase tracking-wide text-muted-foreground-subtle">
          BY CATEGORY active
        </span>
        <ViewTabs value="category" onValueChange={() => {}} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-micro uppercase tracking-wide text-muted-foreground-subtle">
          TIMELINE active
        </span>
        <ViewTabs value="timeline" onValueChange={() => {}} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="font-mono text-micro uppercase tracking-wide text-muted-foreground-subtle">
          DEPENDENCIES active (hover an inactive tab; tab in for focus ring)
        </span>
        <ViewTabs value="dependencies" onValueChange={() => {}} />
      </div>
    </div>
  ),
};
