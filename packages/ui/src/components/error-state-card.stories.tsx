import type { Meta, StoryObj } from "@storybook/react-vite";
import { ErrorStateCard } from "./error-state-card";

const meta = {
  title: "Components/ErrorStateCard",
  component: ErrorStateCard,
  parameters: { layout: "centered" },
  args: {
    body: "Couldn’t find anything matching that. Try rephrasing the command.",
  },
} satisfies Meta<typeof ErrorStateCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// no-results — the canonical advisory (header + body, no action).
export const NoResults: Story = {
  args: {},
};

// with the voice-retry action button.
export const WithRetry: Story = {
  args: { actionLabel: "Say it again" },
};
