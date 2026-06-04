import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";

import { OAuthButton } from "./google-button";

// Renders at the auth-form width so the full-width outline button reads the way
// it does on the sign-in / sign-up surfaces.
const widthDecorator: Decorator = (Story) => (
  <div className="w-80">
    <Story />
  </div>
);

const meta = {
  title: "Components/OAuthButton",
  component: OAuthButton,
  parameters: { layout: "centered" },
  argTypes: {
    label: { control: "text" },
    disabled: { control: "boolean" },
  },
  decorators: [widthDecorator],
} satisfies Meta<typeof OAuthButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// default — Google: mono "G" in $primary + "Continue with Google".
export const Google: Story = {};

// disabled — dims to opacity 0.5, non-interactive (matches loading state).
export const Disabled: Story = {
  args: { disabled: true },
};
