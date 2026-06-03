import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircleDot, TriangleAlert } from "lucide-react";

import { Badge } from "./badge";

const meta = {
  title: "Components/Badge",
  component: Badge,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Badge>;

export default meta;

type Story = StoryObj<typeof meta>;

// Base 3 (showcase RcvKu): outline · base / muted / accent tint.
export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const Muted: Story = {
  args: { variant: "muted", children: "Muted" },
};

export const Accent: Story = {
  args: { variant: "accent", children: "Accent" },
};

// Redundant channels (LOCKED #6): leading 12px icon or 6px dot.
export const WithIcon: Story = {
  args: { variant: "accent", icon: TriangleAlert, children: "Warning" },
};

export const WithDot: Story = {
  args: { variant: "outline", dot: true, children: "Live" },
};

export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline">Outline</Badge>
        <Badge variant="muted">Muted</Badge>
        <Badge variant="accent">Accent</Badge>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="outline" dot>
          Text + Dot
        </Badge>
        <Badge variant="muted" icon={CircleDot}>
          Text + Icon
        </Badge>
        <Badge variant="accent" icon={TriangleAlert}>
          Accent + Icon
        </Badge>
      </div>
    </div>
  ),
};
