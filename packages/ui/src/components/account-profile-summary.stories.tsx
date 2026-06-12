import type { Meta, StoryObj } from "@storybook/react-vite";
import { AccountProfileSummary } from "./account-profile-summary";

const meta = {
  title: "Components/AccountProfileSummary",
  component: AccountProfileSummary,
  parameters: { layout: "centered" },
  args: { email: "alex.mercer@example.com" },
} satisfies Meta<typeof AccountProfileSummary>;

export default meta;

type Story = StoryObj<typeof meta>;

export const WithName: Story = {
  args: {
    name: "Alex Mercer",
    email: "alex.mercer@example.com",
    memberSince: "Member since 03 Jun 2026",
  },
};

// No display name (e.g. email signup) — initials fall back to the email local-part.
export const EmailOnly: Story = {
  args: {
    email: "ryan@example.com",
    memberSince: "Member since 12 Jun 2026",
  },
};
