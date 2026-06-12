import type { Meta, StoryObj } from "@storybook/react-vite";
import { DangerZoneCard, DangerZoneRow } from "./danger-zone-card";
import { Button } from "./button";

const meta = {
  title: "Components/DangerZoneCard",
  component: DangerZoneCard,
  parameters: { layout: "padded" },
  args: { children: null },
} satisfies Meta<typeof DangerZoneCard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="max-w-xl">
      <DangerZoneCard>
        <DangerZoneRow
          label="Export my data"
          description="Download all your missions, tasks, and preferences as JSON."
        >
          <Button variant="outline" size="sm">
            Export
          </Button>
        </DangerZoneRow>
        <DangerZoneRow
          label="Delete account"
          description="Permanently delete your account and all associated data."
        >
          <Button variant="destructive" size="sm">
            Delete
          </Button>
        </DangerZoneRow>
      </DangerZoneCard>
    </div>
  ),
};
