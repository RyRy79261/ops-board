import type { Meta, StoryObj } from "@storybook/react-vite";

import { MissionDetailHeader } from "./mission-detail-header";

const meta = {
  title: "Components/MissionDetailHeader",
  component: MissionDetailHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MissionDetailHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The Dependencies/Timeline specimen: TARGET line with a live days-out countdown. */
export const Populated: Story = {
  args: {
    title: "AfrikaBurn 2026",
    targetDate: "27 APR 2026",
    daysOut: 328,
    stats: { done: 3, blocked: 3, closing: 2, total: 11 },
    progress: { done: 3, closing: 2, blocked: 3, total: 11 },
  },
};

/** All tasks done — full success bar (date alone, no countdown). */
export const AllDone: Story = {
  args: {
    title: "Schengen Renewal",
    targetDate: "12 AUG 2026",
    stats: { done: 8, blocked: 0, closing: 0, total: 8 },
    progress: { done: 8, closing: 0, blocked: 0, total: 8 },
  },
};

/** No target date set. */
export const NoTarget: Story = {
  args: {
    title: "Backup Mission",
    targetDate: null,
    stats: { done: 0, blocked: 0, closing: 0, total: 5 },
    progress: { done: 0, closing: 0, blocked: 0, total: 5 },
  },
};

/** Heavy blocked + closing mix. */
export const UnderPressure: Story = {
  args: {
    title: "Kilimanjaro",
    targetDate: "03 SEP 2026",
    daysOut: 83,
    stats: { done: 1, blocked: 4, closing: 3, total: 7 },
    progress: { done: 1, closing: 3, blocked: 4, total: 7 },
  },
};
