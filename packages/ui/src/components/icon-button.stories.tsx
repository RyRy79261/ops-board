import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bell, Ellipsis, Search, Settings } from "lucide-react";

import { IconButton } from "./icon-button";

const meta = {
  title: "Components/IconButton",
  component: IconButton,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["ghost", "primary", "outline"],
    },
  },
  args: {
    icon: Ellipsis,
    "aria-label": "More",
    variant: "ghost",
  },
} satisfies Meta<typeof IconButton>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Variants (showcase RcvKu: ghost·base / primary / outline, 36×36 ellipsis) ──
export const Ghost: Story = { args: { variant: "ghost" } };
export const Primary: Story = { args: { variant: "primary" } };
export const Outline: Story = { args: { variant: "outline" } };

export const Disabled: Story = { args: { variant: "outline", disabled: true } };

// All variants side by side.
export const Variants: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <IconButton variant="ghost" icon={Ellipsis} aria-label="More" />
      <IconButton variant="primary" icon={Ellipsis} aria-label="More" />
      <IconButton variant="outline" icon={Ellipsis} aria-label="More" />
    </div>
  ),
};

// Variant × state grid.
export const Matrix: Story = {
  render: () => (
    <div className="grid grid-cols-[auto_repeat(3,1fr)] items-center gap-x-6 gap-y-3 font-mono text-mono-caption text-muted-foreground">
      <span />
      <span className="text-center">ghost</span>
      <span className="text-center">primary</span>
      <span className="text-center">outline</span>

      <span>default</span>
      <div className="flex justify-center">
        <IconButton variant="ghost" icon={Ellipsis} aria-label="More" />
      </div>
      <div className="flex justify-center">
        <IconButton variant="primary" icon={Ellipsis} aria-label="More" />
      </div>
      <div className="flex justify-center">
        <IconButton variant="outline" icon={Ellipsis} aria-label="More" />
      </div>

      <span>disabled</span>
      <div className="flex justify-center">
        <IconButton variant="ghost" icon={Ellipsis} aria-label="More" disabled />
      </div>
      <div className="flex justify-center">
        <IconButton variant="primary" icon={Ellipsis} aria-label="More" disabled />
      </div>
      <div className="flex justify-center">
        <IconButton variant="outline" icon={Ellipsis} aria-label="More" disabled />
      </div>
    </div>
  ),
};

// Canonical AppHeader Actions cluster (SyncStatus/Search/Notifications/More).
export const HeaderActions: Story = {
  render: () => (
    <div className="flex items-center gap-1 bg-muted px-3 py-2">
      <IconButton variant="ghost" icon={Search} aria-label="Search" />
      <IconButton variant="ghost" icon={Bell} aria-label="Notifications" />
      <IconButton variant="ghost" icon={Settings} aria-label="Settings" />
      <IconButton variant="ghost" icon={Ellipsis} aria-label="More" />
    </div>
  ),
};
