import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  StatusCycleButton,
  Touch44,
  type StatusCycleStatus,
} from "./status-cycle-button";

const meta = {
  title: "Components/StatusCycleButton",
  component: StatusCycleButton,
  parameters: { layout: "centered" },
  argTypes: {
    status: {
      control: "inline-radio",
      options: ["not-started", "in-progress", "done"],
    },
    size: { control: { type: "number" } },
    disabled: { control: "boolean" },
  },
  args: { status: "not-started", onCycle: () => {} },
} satisfies Meta<typeof StatusCycleButton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Interactive wrapper that actually cycles the stored status on tap. */
function Cycling({
  initial = "not-started",
}: {
  initial?: StatusCycleStatus;
}) {
  const next: Record<StatusCycleStatus, StatusCycleStatus> = {
    "not-started": "in-progress",
    "in-progress": "done",
    done: "not-started",
  };
  const [status, setStatus] = React.useState<StatusCycleStatus>(initial);
  const cycle = () => setStatus((s) => next[s]);
  return (
    <Touch44>
      <StatusCycleButton status={status} onCycle={cycle} />
    </Touch44>
  );
}

export const NotStarted: Story = { args: { status: "not-started" } };
export const InProgress: Story = { args: { status: "in-progress" } };
export const Done: Story = { args: { status: "done" } };

/** All three stored states side by side (no glyph / ◼ / ✓). */
export const States: Story = {
  render: () => (
    <div className="flex items-center gap-6">
      {(["not-started", "in-progress", "done"] as const).map((status) => (
        <div key={status} className="flex flex-col items-center gap-2">
          <StatusCycleButton status={status} onCycle={() => {}} />
          <span className="font-mono text-micro uppercase tracking-wide text-muted-foreground">
            {status}
          </span>
        </div>
      ))}
    </div>
  ),
};

/**
 * The contract's REQUIRED ≥44px Touch44 hit-area wrapper around the 18px square,
 * with the tap-cycle live. Hover the not-started square to see the $success border.
 */
export const WithTouch44: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Cycling initial="not-started" />
      <Cycling initial="in-progress" />
      <Cycling initial="done" />
    </div>
  ),
};

/**
 * Board row context: done dims the paired task name to $muted-foreground (no
 * line-through — text-decoration is absent across all done rows per the contract).
 */
export const InTaskRow: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      <div className="flex items-center gap-3">
        <Touch44>
          <StatusCycleButton status="not-started" onCycle={() => {}} />
        </Touch44>
        <span className="text-body text-foreground">Pack medical kit</span>
      </div>
      <div className="flex items-center gap-3">
        <Touch44>
          <StatusCycleButton status="in-progress" onCycle={() => {}} />
        </Touch44>
        <span className="text-body text-foreground">File visa application</span>
      </div>
      <div className="flex items-center gap-3">
        <Touch44>
          <StatusCycleButton status="done" onCycle={() => {}} />
        </Touch44>
        <span className="text-body text-muted-foreground">Book flights</span>
      </div>
    </div>
  ),
};

/** Always-enabled guard (§10): blocked/closed rows never disable the button. */
export const AlwaysEnabled: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Touch44>
        <StatusCycleButton status="not-started" onCycle={() => {}} />
      </Touch44>
      <span className="font-mono text-mono-caption text-muted-foreground-subtle">
        blocked / closed rows stay interactive
      </span>
    </div>
  ),
};
