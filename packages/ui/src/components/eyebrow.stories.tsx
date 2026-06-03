import type { Meta, StoryObj } from "@storybook/react-vite";
import { Eyebrow } from "./eyebrow";

const meta = {
  title: "Components/Eyebrow",
  component: Eyebrow,
  parameters: { layout: "centered" },
  args: { children: "Section Label" },
} satisfies Meta<typeof Eyebrow>;

export default meta;

type Story = StoryObj<typeof meta>;

// muted · base — $muted-foreground, 11/600 +1.5 (showcase canonical)
export const Muted: Story = {
  args: { children: "Section Label" },
};

// foreground — emphasized $foreground (e.g. "ACTIVE WINDOWS")
export const Foreground: Story = {
  args: { tone: "foreground", children: "Active Windows" },
};

// accent — $primary (quick-actions / active, e.g. "QUICK ACTIONS")
export const Accent: Story = {
  args: { tone: "accent", children: "Quick Actions" },
};

// subtle — $muted-foreground-subtle (stat labels, dep hints, "not yet" reasons)
export const Subtle: Story = {
  args: { tone: "subtle", children: "Not Yet" },
};

// heavy — 700 weight, +2 tracking (library "Label/Eyebrow" cell)
export const Heavy: Story = {
  args: { weight: 700, tracking: 2, children: "Section Eyebrow" },
};

// All tones stacked for quick comparison.
export const Tones: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Eyebrow tone="muted">Missions</Eyebrow>
      <Eyebrow tone="foreground">Active Windows</Eyebrow>
      <Eyebrow tone="accent">Quick Actions</Eyebrow>
      <Eyebrow tone="subtle">Critical Path</Eyebrow>
    </div>
  ),
};

// Matrix — tone × weight grid showing the full union of variants/states.
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Eyebrow tone="subtle" className="opacity-70">
          Weight 600 / +1.5
        </Eyebrow>
        <div className="flex flex-col gap-2">
          <Eyebrow tone="muted">Muted</Eyebrow>
          <Eyebrow tone="foreground">Foreground</Eyebrow>
          <Eyebrow tone="accent">Accent</Eyebrow>
          <Eyebrow tone="subtle">Subtle</Eyebrow>
        </div>
      </div>
      <div className="flex flex-col gap-2">
        <Eyebrow tone="subtle" className="opacity-70">
          Weight 700 / +2 (heavy)
        </Eyebrow>
        <div className="flex flex-col gap-2">
          <Eyebrow tone="muted" weight={700} tracking={2}>
            Muted
          </Eyebrow>
          <Eyebrow tone="foreground" weight={700} tracking={2}>
            Foreground
          </Eyebrow>
          <Eyebrow tone="accent" weight={700} tracking={2}>
            Accent
          </Eyebrow>
          <Eyebrow tone="subtle" weight={700} tracking={2}>
            Subtle
          </Eyebrow>
        </div>
      </div>
    </div>
  ),
};

// As a semantic section heading (a11y: titles a section, not a bare span).
export const SemanticHeading: Story = {
  args: { as: "h2", tone: "foreground", children: "Dependency Tree" },
};
