import type { Meta, StoryObj } from "@storybook/react-vite";
import { SourceRow } from "./source-row";

const meta = {
  title: "Components/AI Research/SourceRow",
  component: SourceRow,
  parameters: { layout: "padded" },
  args: {
    domain: "tankwatown.org",
    title: "Land-use permits — Tankwa Karoo",
    href: "https://tankwatown.org/permits",
  },
} satisfies Meta<typeof SourceRow>;

export default meta;

type Story = StoryObj<typeof meta>;

// A single OK source with a working link.
export const Ok: Story = {
  args: { faviconTone: "bg-cat-bureaucratic" },
};

// The full sources list as it appears inside an AINotesBlock (dividers on 2+).
export const List: Story = {
  render: () => (
    <div className="max-w-xl">
      <SourceRow
        domain="tankwatown.org"
        title="Land-use permits — Tankwa Karoo"
        href="https://tankwatown.org/permits"
        faviconTone="bg-cat-bureaucratic"
      />
      <SourceRow
        domain="capenature.co.za"
        title="Regional offices & contacts"
        href="https://capenature.co.za/offices"
        faviconTone="bg-cat-travel"
        divider
      />
      <SourceRow
        domain="gov.za"
        title="Public land-use guidance"
        href="https://gov.za/land-use"
        faviconTone="bg-cat-gear"
        divider
      />
    </div>
  ),
};

// The failed-source layout (PARTIAL RESULTS) — no favicon/title/link.
export const Failed: Story = {
  render: () => (
    <div className="max-w-xl border border-border bg-card-elevated">
      <SourceRow status="failed" domain="dha.gov.za" />
      <SourceRow status="failed" domain="sars.gov.za" divider />
    </div>
  ),
};
