import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./status-badge";

const meta = {
  title: "Components/StatusBadge",
  component: StatusBadge,
  parameters: { layout: "centered" },
  args: { status: "not-started" },
} satisfies Meta<typeof StatusBadge>;

export default meta;

type Story = StoryObj<typeof meta>;

/** not-started · base — bordered ($border, $muted-foreground, circle-dashed). */
export const NotStarted: Story = {
  args: { status: "not-started" },
};

/** in-progress — primary/12 tint, no stroke, $primary (circle-dot). */
export const InProgress: Story = {
  args: { status: "in-progress" },
};

/** done — success/12 tint, no stroke, $success (check). */
export const Done: Story = {
  args: { status: "done" },
};

/** The 3 showcase RcvKu variants at their canonical default render. */
export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <StatusBadge status="not-started" />
      <StatusBadge status="in-progress" />
      <StatusBadge status="done" />
    </div>
  ),
};

/** Render-mode matrix: every status × bordered/tinted. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 font-mono text-mono-caption text-muted-foreground-subtle">
          bordered
        </span>
        <StatusBadge status="not-started" variant="bordered" />
        <StatusBadge status="in-progress" variant="bordered" />
        <StatusBadge status="done" variant="bordered" />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="w-16 font-mono text-mono-caption text-muted-foreground-subtle">
          tinted
        </span>
        <StatusBadge status="not-started" variant="tinted" />
        <StatusBadge status="in-progress" variant="tinted" />
        <StatusBadge status="done" variant="tinted" />
      </div>
    </div>
  ),
};
