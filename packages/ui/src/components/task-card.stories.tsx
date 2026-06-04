import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { TaskCard, type TaskVM, type TaskStatus } from "./task-card";

// Fixed "now" so the derived window-states are deterministic in the story.
// 2026-06-04T12:00:00Z. Cliffs are authored relative to this instant.
const NOW = Date.UTC(2026, 5, 4, 12, 0, 0);
const TZ = "Africa/Johannesburg";

const meta = {
  title: "Components/TaskCard",
  component: TaskCard,
  parameters: { layout: "padded" },
  args: {
    task: {
      id: "t0",
      name: "Get fitness-to-travel cert (Dr. Ruf)",
      status: "not-started",
      categorySlug: "medical",
      too_late_by: null,
      not_before: null,
      blocked: false,
      blockedByNames: [],
    },
    tz: TZ,
    now: NOW,
    onCycle: () => {},
  },
} satisfies Meta<typeof TaskCard>;

export default meta;

type Story = StoryObj<typeof meta>;

function iso(daysFromNow: number): string {
  const d = new Date(NOW + daysFromNow * 86_400_000);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(
    d.getUTCDate(),
  ).padStart(2, "0")}`;
}

const baseTask: TaskVM = {
  id: "t1",
  name: "Get fitness-to-travel cert (Dr. Ruf)",
  status: "not-started",
  categorySlug: "medical",
  too_late_by: null,
  not_before: null,
  blocked: false,
  blockedByNames: [],
};

// Constrain to a single-column board width.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[430px]">{children}</div>
);

/** Stateful wrapper so the StatusCycleButton actually cycles in the story. */
function Live({ task }: { task: TaskVM }) {
  const [status, setStatus] = React.useState<TaskStatus>(task.status);
  return (
    <Frame>
      <TaskCard
        task={{ ...task, status }}
        tz={TZ}
        now={NOW}
        onCycle={(next) => setStatus(next)}
      />
    </Frame>
  );
}

/** OPEN + done — bare/no pill, line-through name. */
export const DoneOpen: Story = {
  render: () => (
    <Live
      task={{
        ...baseTask,
        id: "done",
        name: "Book cardiology follow-up",
        status: "done",
        too_late_by: iso(40),
      }}
    />
  ),
};

/** CLOSING — within 7 days; warning accent + timer pill. */
export const Closing: Story = {
  render: () => (
    <Live task={{ ...baseTask, id: "closing", too_late_by: iso(5) }} />
  ),
};

/** CLOSED — past the cliff; $muted card, dimmed, WINDOW CLOSED pill + date. */
export const Closed: Story = {
  render: () => (
    <Live
      task={{
        ...baseTask,
        id: "closed",
        name: "Confirm TK §18 SGB V coverage",
        categorySlug: "bureaucratic",
        too_late_by: iso(-3),
      }}
    />
  ),
};

/** BLOCKED — derived dependency; dim card + BLOCKED pill + blocked-by caption. */
export const Blocked: Story = {
  render: () => (
    <Live
      task={{
        ...baseTask,
        id: "blocked",
        name: "Brief AB medical team",
        blocked: true,
        blockedByNames: ["Get fitness-to-travel cert (Dr. Ruf)"],
      }}
    />
  ),
};

/** NOT_YET (not_before) — lock pill + 'starts {date}', dim card. */
export const NotYet: Story = {
  render: () => (
    <Live
      task={{
        ...baseTask,
        id: "not-yet",
        name: "Flash LED suit firmware",
        categorySlug: "tech",
        not_before: iso(6),
      }}
    />
  ),
};

/** IN_PROGRESS, open — primary status fill, no pill. */
export const InProgress: Story = {
  render: () => (
    <Live
      task={{
        ...baseTask,
        id: "in-progress",
        name: "Buy goggles & dust mask",
        status: "in-progress",
        categorySlug: "gear",
      }}
    />
  ),
};

/** Critical-path emphasis — primary left accent. */
export const CriticalPath: Story = {
  render: () => (
    <Frame>
      <TaskCard
        task={{
          ...baseTask,
          id: "crit",
          name: "Submit visa application",
          categorySlug: "bureaucratic",
          too_late_by: iso(4),
        }}
        tz={TZ}
        now={NOW}
        criticalPath
        onCycle={() => {}}
      />
    </Frame>
  ),
};

/** The full state matrix stacked (Category board layout). */
export const StateMatrix: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-2.5">
        <TaskCard
          task={{ ...baseTask, id: "1", name: "Book cardiology follow-up", status: "done", too_late_by: iso(40) }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={{ ...baseTask, id: "2", too_late_by: iso(5) }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={{
            ...baseTask,
            id: "3",
            name: "Brief AB medical team",
            blocked: true,
            blockedByNames: ["Get fitness-to-travel cert (Dr. Ruf)"],
          }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={{
            ...baseTask,
            id: "4",
            name: "Confirm TK §18 SGB V coverage",
            categorySlug: "bureaucratic",
            too_late_by: iso(-3),
          }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={{
            ...baseTask,
            id: "5",
            name: "Buy goggles & dust mask",
            status: "in-progress",
            categorySlug: "gear",
          }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
        <TaskCard
          task={{
            ...baseTask,
            id: "6",
            name: "Flash LED suit firmware",
            categorySlug: "tech",
            not_before: iso(6),
          }}
          tz={TZ}
          now={NOW}
          onCycle={() => {}}
        />
      </div>
    </Frame>
  ),
};
