import type { Meta, StoryObj } from "@storybook/react-vite";
import { Alert } from "./alert";

const meta = {
  title: "Components/Alert",
  component: Alert,
  parameters: { layout: "padded" },
  args: {
    variant: "info",
    title: "HEADS UP",
    children: "An inline advisory banner. Persistent, never auto-dismisses.",
  },
} satisfies Meta<typeof Alert>;

export default meta;

type Story = StoryObj<typeof meta>;

/** info (default) — $info aliases the brand orange (#ff6b35); lucide `info`. */
export const Info: Story = {
  args: {
    variant: "info",
    title: "HEADS UP",
    children: "Two tasks share a dependency — closing one unblocks the other.",
  },
};

/** warning — amber "closing" advisory; `triangle-alert`. */
export const Warning: Story = {
  args: {
    variant: "warning",
    title: "WINDOW CLOSING",
    children: "The visa window closes in 5 days. Submit the application soon.",
  },
};

/** destructive — genuine danger / blocked-by-upstream; `octagon-alert` (role=alert). */
export const Destructive: Story = {
  args: {
    variant: "destructive",
    title: "BLOCKED",
    children: "This task is blocked by an upstream dependency that is not yet done.",
  },
};

/** All three tones stacked — the full UNION from the showcase refs. */
export const Variants: Story = {
  render: () => (
    <div className="flex w-full max-w-md flex-col gap-3">
      <Alert variant="info" title="HEADS UP">
        Two tasks share a dependency — closing one unblocks the other.
      </Alert>
      <Alert variant="warning" title="WINDOW CLOSING">
        The visa window closes in 5 days. Submit the application soon.
      </Alert>
      <Alert variant="destructive" title="BLOCKED">
        This task is blocked by an upstream dependency that is not yet done.
      </Alert>
    </div>
  ),
};
