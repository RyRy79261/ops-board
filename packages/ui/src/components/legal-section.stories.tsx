import type { Meta, StoryObj } from "@storybook/react-vite";
import { LegalSection } from "./legal-section";
import { CodeCallout } from "./code-callout";

const meta = {
  title: "Components/LegalSection",
  component: LegalSection,
  parameters: { layout: "padded" },
  args: { title: "Data we store", children: null },
} satisfies Meta<typeof LegalSection>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <LegalSection marker="§01" title="Data we store">
      <p>
        OpsBoard stores the missions and tasks you create, plus your encrypted AI
        keys. We never store the raw key material.
      </p>
      <CodeCallout tone="warning" title="Retention">
        Voice clips are kept for 30 days, then deleted automatically.
      </CodeCallout>
    </LegalSection>
  ),
};
