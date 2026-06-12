import type { Meta, StoryObj } from "@storybook/react-vite";
import { SyncStatus } from "./sync-status";

const meta = {
  title: "Components/SyncStatus",
  component: SyncStatus,
  parameters: { layout: "centered" },
  args: { state: "synced" },
} satisfies Meta<typeof SyncStatus>;

export default meta;

type Story = StoryObj<typeof meta>;

// plain · synced — green dot + SYNCED (showcase / mobile idiom).
export const Synced: Story = {
  args: { state: "synced" },
};

// plain · syncing — warning dot + SYNCING….
export const Syncing: Story = {
  args: { state: "syncing" },
};

// plain · offline — muted dot + OFFLINE.
export const Offline: Story = {
  args: { state: "offline" },
};

// operator block — SOLO OPERATOR · live dot · date (Dependencies-desktop header).
export const OperatorBlock: Story = {
  args: { leadingLabel: "SOLO OPERATOR", dateLabel: "12 JUN 2026" },
};

// All renderings stacked for comparison.
export const All: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <SyncStatus state="synced" />
      <SyncStatus state="syncing" />
      <SyncStatus state="offline" />
      <SyncStatus leadingLabel="SOLO OPERATOR" dateLabel="12 JUN 2026" />
    </div>
  ),
};
