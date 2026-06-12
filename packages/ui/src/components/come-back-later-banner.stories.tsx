import type { Meta, StoryObj } from "@storybook/react-vite";
import { ComeBackLaterBanner } from "./come-back-later-banner";

const meta = {
  title: "Components/AI Research/ComeBackLaterBanner",
  component: ComeBackLaterBanner,
  parameters: { layout: "padded" },
  args: {
    variant: "primary",
    onMinimize: () => {},
    onComeBackLater: () => {},
  },
} satisfies Meta<typeof ComeBackLaterBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop §2.2 (c) — the authoritative primary accent banner with both actions.
export const Primary: Story = {
  args: {},
};

// Mobile §3.2 (c) — the canonical muted Alert: single bell + one line, no buttons.
export const Muted: Story = {
  args: { variant: "muted" },
};

// Primary with custom copy (still both actions).
export const PrimaryCustomCopy: Story = {
  args: {
    title: "Still working on it",
    body: "Close the tab if you like — your results will be waiting when you return.",
  },
};

// Mobile muted in a narrow viewport to show the stacked, button-less rendering.
export const MutedMobile: Story = {
  args: { variant: "muted" },
  parameters: { viewport: { defaultViewport: "mobile1" } },
};
