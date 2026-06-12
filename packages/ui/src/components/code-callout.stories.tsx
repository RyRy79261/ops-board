import type { Meta, StoryObj } from "@storybook/react-vite";
import { CodeCallout } from "./code-callout";

const meta = {
  title: "Components/CodeCallout",
  component: CodeCallout,
  parameters: { layout: "padded" },
  args: { children: "Body text for the callout." },
} satisfies Meta<typeof CodeCallout>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Info: Story = {
  args: { tone: "info", title: "Good to know", children: "Your keys stay encrypted at rest." },
};

export const Warning: Story = {
  args: { tone: "warning", title: "Heads up", children: "Deleting a mission removes its tasks too." },
};

export const Danger: Story = {
  args: { tone: "danger", title: "Irreversible", children: "This cannot be undone." },
};

export const CodeForm: Story = {
  args: {
    mono: true,
    children: `# say
"create a mission called Book the trip"
→ Mission created ✓`,
  },
};
