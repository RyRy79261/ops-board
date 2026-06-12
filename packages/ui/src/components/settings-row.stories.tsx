import type { Meta, StoryObj } from "@storybook/react-vite";
import { SettingsRow } from "./settings-row";
import { SettingsGroup } from "./settings-group";
import { Switch } from "./switch";

const meta = {
  title: "Components/SettingsRow",
  component: SettingsRow,
  parameters: { layout: "padded" },
  args: { label: "Setting" },
} satisfies Meta<typeof SettingsRow>;

export default meta;

type Story = StoryObj<typeof meta>;

// toggle row — label + description + trailing Switch.
export const Toggle: Story = {
  args: {
    label: "Confirm destructive commands",
    description: "Ask before a voice command deletes a task or mission.",
    children: <Switch defaultChecked aria-label="Confirm destructive commands" />,
  },
};

// nav row — label + trailing chevron (consumer wraps in a link).
export const Nav: Story = {
  args: {
    label: "AI keys",
    description: "Manage your Anthropic + Groq keys.",
    chevron: true,
  },
};

// grouped — a full SettingsGroup card with mixed rows + dividers.
export const Grouped: Story = {
  render: () => (
    <div className="max-w-md">
      <SettingsGroup title="Voice & Microphone">
        <SettingsRow
          label="Confirm destructive commands"
          description="Ask before a voice command deletes a task or mission."
        >
          <Switch defaultChecked aria-label="Confirm destructive commands" />
        </SettingsRow>
        <SettingsRow
          label="Notify on closing windows"
          description="Remind me when a task's window is about to close."
        >
          <Switch aria-label="Notify on closing windows" />
        </SettingsRow>
        <SettingsRow label="AI keys" description="Anthropic + Groq." chevron />
      </SettingsGroup>
    </div>
  ),
};
