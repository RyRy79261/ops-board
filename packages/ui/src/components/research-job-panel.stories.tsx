import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResearchJobPanel, type ResearchJobStep } from "./research-job-panel";

const STEPS: ResearchJobStep[] = [
  { state: "done", label: "Parsed intent" },
  { state: "done", label: "Identified task scope", meta: "tankwa land-use" },
  { state: "done", label: "Searched the web", meta: "8 RESULTS" },
  {
    state: "active",
    label: "Reading source 3 of 6",
    source: "tankwatown.org",
  },
  { state: "pending", label: "Extracting steps…" },
  { state: "pending", label: "Drafting notes…" },
  { state: "pending", label: "Appending to task" },
];

const MOBILE_STEPS: ResearchJobStep[] = [
  { state: "done", label: "Parsed intent · resolved target task" },
  { state: "done", label: "Searched the web · 8 results" },
  { state: "active", label: "Reading source 3 of 6 · tankwatown.org" },
  { state: "pending", label: "Extracting steps" },
  { state: "pending", label: "Drafting notes" },
];

const meta = {
  title: "Components/AI Research/ResearchJobPanel",
  component: ResearchJobPanel,
  parameters: { layout: "padded" },
  args: {
    taskName: "Tankwa land-use permit",
    elapsedLabel: "00:42",
    currentStep: 3,
    totalSteps: 6,
    stepNote: "reading sources",
    steps: STEPS,
    streaming: true,
    variant: "desktop",
  },
} satisfies Meta<typeof ResearchJobPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

// §2.2 (a)+(b) — the authoritative desktop job card + LIVE STEP LOG.
export const Desktop: Story = {
  render: (args) => (
    <div className="max-w-[640px]">
      <ResearchJobPanel {...args} />
    </div>
  ),
};

// §3.2 (b) — the single-card mobile rendering (inlined timer, flatter log).
export const Mobile: Story = {
  args: {
    variant: "mobile",
    taskName: "Submit Tankwa land-use permit",
    steps: MOBILE_STEPS,
  },
  render: (args) => (
    <div className="max-w-[380px]">
      <ResearchJobPanel {...args} />
    </div>
  ),
};

// Streaming indicator off (job paused / stalled).
export const NotStreaming: Story = {
  args: { streaming: false },
  render: (args) => (
    <div className="max-w-[640px]">
      <ResearchJobPanel {...args} />
    </div>
  ),
};

// Desktop + mobile side by side for a quick responsive read.
export const Both: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="w-[640px] max-w-full">
        <ResearchJobPanel {...args} />
      </div>
      <div className="w-[380px] max-w-full">
        <ResearchJobPanel
          {...args}
          variant="mobile"
          taskName="Submit Tankwa land-use permit"
          steps={MOBILE_STEPS}
        />
      </div>
    </div>
  ),
};
