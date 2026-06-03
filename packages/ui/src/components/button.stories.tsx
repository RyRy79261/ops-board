import type { Meta, StoryObj } from "@storybook/react-vite";
import { Save, Trash2 } from "lucide-react";

import { Button } from "./button";

const meta = {
  title: "Components/Button",
  component: Button,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: [
        "primary",
        "secondary",
        "outline",
        "ghost",
        "destructive",
        "link",
      ],
    },
    size: {
      control: "inline-radio",
      options: ["sm", "base", "lg", "xl", "icon"],
    },
    disabled: { control: "boolean" },
  },
  args: { children: "Save", variant: "primary", size: "base" },
} satisfies Meta<typeof Button>;

export default meta;

type Story = StoryObj<typeof meta>;

/* ── Variants ───────────────────────────────────────────────────────────── */

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete" },
};
export const Link: Story = { args: { variant: "link", children: "Learn more" } };

/* ── States ─────────────────────────────────────────────────────────────── */

export const Disabled: Story = { args: { disabled: true } };

export const WithLeadingIcon: Story = {
  render: () => (
    <Button variant="primary">
      <Save />
      Save
    </Button>
  ),
};

/**
 * The Voice & Toasts confirmation-toast action row — the canonical screen use
 * of Button: DELETE (destructive) + CANCEL (outline).
 */
export const ToastActionRow: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button variant="destructive">
        <Trash2 />
        Delete
      </Button>
      <Button variant="outline">Cancel</Button>
    </div>
  ),
};

/* ── Sizes ──────────────────────────────────────────────────────────────── */

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Button size="sm">Small</Button>
      <Button size="base">Base</Button>
      <Button size="lg">Large</Button>
      <Button size="xl">XLarge</Button>
      <Button size="icon" aria-label="Save">
        <Save />
      </Button>
    </div>
  ),
};

/* ── Matrix: every variant × default / disabled ─────────────────────────── */

const VARIANTS = [
  "primary",
  "secondary",
  "outline",
  "ghost",
  "destructive",
  "link",
] as const;

export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-eyebrow uppercase tracking-[0.125em] text-muted-foreground-subtle">
          Default
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant}>
              {variant}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-eyebrow uppercase tracking-[0.125em] text-muted-foreground-subtle">
          Disabled
        </span>
        <div className="flex flex-wrap items-center gap-3">
          {VARIANTS.map((variant) => (
            <Button key={variant} variant={variant} disabled>
              {variant}
            </Button>
          ))}
        </div>
      </div>
    </div>
  ),
};
