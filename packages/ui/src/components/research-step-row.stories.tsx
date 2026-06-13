import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResearchStepRow } from "./research-step-row";

const meta = {
  title: "Components/AI Research/ResearchStepRow",
  component: ResearchStepRow,
  parameters: { layout: "padded" },
  args: { state: "active", label: "Reading source 3 of 6", source: "tankwatown.org" },
} satisfies Meta<typeof ResearchStepRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Active: Story = {};

export const Done: Story = {
  args: { state: "done", label: "Searched the web", meta: "8 RESULTS", source: undefined },
};

export const Pending: Story = {
  args: { state: "pending", label: "Drafting notes…", source: undefined },
};

// The full live log as it streams.
export const Log: Story = {
  render: () => (
    <div className="max-w-xl border border-border bg-card py-2">
      <ResearchStepRow state="done" label="Parsed intent" />
      <ResearchStepRow state="done" label="Identified task scope" meta="tankwa land-use" />
      <ResearchStepRow state="done" label="Searched the web" meta="8 RESULTS" />
      <ResearchStepRow state="active" label="Reading source 3 of 6" source="tankwatown.org" />
      <ResearchStepRow state="pending" label="Extracting steps…" />
      <ResearchStepRow state="pending" label="Drafting notes…" />
      <ResearchStepRow state="pending" label="Appending to task" />
    </div>
  ),
};
