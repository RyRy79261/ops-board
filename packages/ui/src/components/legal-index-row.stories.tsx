import type { Meta, StoryObj } from "@storybook/react-vite";
import { LegalIndexRow } from "./legal-index-row";

const meta = {
  title: "Components/LegalIndexRow",
  component: LegalIndexRow,
  parameters: { layout: "padded" },
  args: { title: "Privacy Policy" },
} satisfies Meta<typeof LegalIndexRow>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    title: "Privacy Policy",
    description: "What we store, why, and your controls.",
    updated: "UPD 12 JUN 2026",
  },
};
