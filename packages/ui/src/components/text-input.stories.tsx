import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { Mail } from "lucide-react";
import { TextInput } from "./text-input";

// Auth/account fields render at a fixed comfortable width; centre them so the
// label + field + helper stack reads cleanly in the showcase.
const widthDecorator: Decorator = (Story) => (
  <div className="w-80">
    <Story />
  </div>
);

const meta = {
  title: "Components/TextInput",
  component: TextInput,
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "inline-radio", options: ["default", "lg"] },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  args: {
    label: "Email Address",
    placeholder: "you@example.com",
    size: "default",
  },
  decorators: [widthDecorator],
} satisfies Meta<typeof TextInput>;

export default meta;

type Story = StoryObj<typeof meta>;

// default / empty — $muted fill, $input stroke, placeholder $muted-foreground-subtle.
export const Default: Story = {};

// filled — a settled typed value in $foreground JetBrains Mono 14.
export const Filled: Story = {
  args: { defaultValue: "dispatch@opsboard.io" },
};

// lg — the 42px field height used on auth/account screens.
export const Large: Story = {
  args: { size: "lg", defaultValue: "dispatch@opsboard.io" },
};

// required — appends a $primary asterisk + sets the HTML required attribute.
export const Required: Story = {
  args: { required: true },
};

// error · destructive — stroke flips to $destructive, helper renders role="alert".
export const Error: Story = {
  args: {
    defaultValue: "not-an-email",
    error: "Enter a valid email address",
  },
};

// helper — supplementary $muted-foreground caption below the field.
export const WithHelper: Story = {
  args: { helper: "We'll only use this to sign you in." },
};

// disabled — dims the whole field to opacity 0.45, non-interactive.
export const Disabled: Story = {
  args: { defaultValue: "locked@opsboard.io", disabled: true },
};

// leading icon — optional 16×16 leading Lucide glyph ($muted-foreground-subtle).
export const LeadingIcon: Story = {
  args: { leadingIcon: Mail },
};

// password — auto reveal toggle: a real button with aria-label + aria-pressed.
export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "••••••••",
    defaultValue: "supersecret",
  },
};

// Matrix — the full union of states/sizes for quick visual review.
export const Matrix: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-5">
      <TextInput label="Default" placeholder="you@example.com" />
      <TextInput label="Filled" defaultValue="dispatch@opsboard.io" />
      <TextInput label="Large (auth)" size="lg" defaultValue="dispatch@opsboard.io" />
      <TextInput
        label="Error"
        defaultValue="not-an-email"
        error="Enter a valid email address"
      />
      <TextInput label="Disabled" defaultValue="locked@opsboard.io" disabled />
      <TextInput label="Password" type="password" defaultValue="supersecret" />
    </div>
  ),
};
