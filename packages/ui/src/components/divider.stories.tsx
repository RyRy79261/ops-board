import type { Meta, StoryObj } from "@storybook/react-vite";

import { Divider } from "./divider";

const meta = {
  title: "Components/Divider",
  component: Divider,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Divider>;

export default meta;

type Story = StoryObj<typeof meta>;

// horizontal hairline (fill $border, height 1, width fill_container) — base
export const Horizontal: Story = {
  render: () => (
    <div className="w-64">
      <p className="font-mono text-mono text-foreground">Above</p>
      <Divider className="my-3" />
      <p className="font-mono text-mono text-foreground">Below</p>
    </div>
  ),
};

// vertical hairline (width 1, height fill_container)
export const Vertical: Story = {
  render: () => (
    <div className="flex h-8 items-center gap-3">
      <span className="font-mono text-mono text-foreground">A</span>
      <Divider orientation="vertical" />
      <span className="font-mono text-mono text-foreground">B</span>
    </div>
  ),
};

// tone: $border-hover (stronger hairline)
export const BorderHover: Story = {
  render: () => (
    <div className="w-64">
      <p className="font-mono text-mono text-foreground">Above</p>
      <Divider tone="border-hover" className="my-3" />
      <p className="font-mono text-mono text-foreground">Below</p>
    </div>
  ),
};

// Combined matrix — both orientations × both tones.
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-card p-6 shadow-e1">
      <div className="flex flex-col gap-4">
        <span className="font-mono text-mono-caption uppercase tracking-[0.125em] text-muted-foreground-subtle">
          horizontal · border
        </span>
        <div className="w-72">
          <Divider />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="font-mono text-mono-caption uppercase tracking-[0.125em] text-muted-foreground-subtle">
          horizontal · border-hover
        </span>
        <div className="w-72">
          <Divider tone="border-hover" />
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <span className="font-mono text-mono-caption uppercase tracking-[0.125em] text-muted-foreground-subtle">
          vertical · border / border-hover
        </span>
        <div className="flex h-10 items-center gap-6">
          <span className="font-mono text-mono text-foreground">A</span>
          <Divider orientation="vertical" />
          <span className="font-mono text-mono text-foreground">B</span>
          <Divider orientation="vertical" tone="border-hover" />
          <span className="font-mono text-mono text-foreground">C</span>
        </div>
      </div>
    </div>
  ),
};
