import type { Meta, StoryObj } from "@storybook/react-vite";

import { MissionDetailHeader } from "./mission-detail-header";

const meta = {
  title: "Components/MissionDetailHeader",
  component: MissionDetailHeader,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof MissionDetailHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The Category-board specimen: AfrikaBurn 2026, 3/3/2/11, 3-segment progress. */
export const Populated: Story = {
  args: {
    title: "AfrikaBurn 2026",
    targetDate: "27 Apr 2026",
    stats: { done: 3, blocked: 3, closing: 2, total: 11 },
    progress: { done: 3, closing: 2, blocked: 3, total: 11 },
  },
};

/** All tasks done — full success bar. */
export const AllDone: Story = {
  args: {
    title: "Schengen Renewal",
    targetDate: "12 Aug 2026",
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
    targetDate: "03 Sep 2026",
    stats: { done: 1, blocked: 4, closing: 3, total: 7 },
    progress: { done: 1, closing: 3, blocked: 4, total: 7 },
  },
};
