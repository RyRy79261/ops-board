import type { Meta, StoryObj } from "@storybook/react-vite";

import { CategoryGroupHeader } from "./category-group-header";

const meta = {
  title: "Components/CategoryGroupHeader",
  component: CategoryGroupHeader,
  parameters: { layout: "padded" },
  args: { color: "#e05a9f", label: "MEDICAL", doneCount: 2, totalCount: 4 },
} satisfies Meta<typeof CategoryGroupHeader>;

export default meta;

type Story = StoryObj<typeof meta>;

// §4 category hues (CategoryVM.color), passed as raw colour strings.
const CAT = {
  medical: "#e05a9f",
  bureaucratic: "#5aa0e0",
  travel: "#5ae0a0",
  gear: "#e0c05a",
  tech: "#a05ae0",
} as const;

export const Medical: Story = {
  args: { color: CAT.medical, label: "MEDICAL", doneCount: 2, totalCount: 4 },
};

export const Bureaucratic: Story = {
  args: {
    color: CAT.bureaucratic,
    label: "BUREAUCRATIC",
    doneCount: 0,
    totalCount: 3,
  },
};

/** All five category headers in render order (Medical → Tech). */
export const AllCategories: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <CategoryGroupHeader color={CAT.medical} label="MEDICAL" doneCount={2} totalCount={4} />
      <CategoryGroupHeader
        color={CAT.bureaucratic}
        label="BUREAUCRATIC"
        doneCount={0}
        totalCount={3}
      />
      <CategoryGroupHeader color={CAT.travel} label="TRAVEL" doneCount={1} totalCount={2} />
      <CategoryGroupHeader color={CAT.gear} label="GEAR" doneCount={0} totalCount={1} />
      <CategoryGroupHeader color={CAT.tech} label="TECH" doneCount={0} totalCount={1} />
    </div>
  ),
};

/** Fully-complete group. */
export const Complete: Story = {
  args: { color: CAT.travel, label: "TRAVEL", doneCount: 2, totalCount: 2 },
};
