import type { Meta, StoryObj } from "@storybook/react-vite";

import { NavCard } from "./nav-card";

const meta = {
  title: "Components/NavCard",
  component: NavCard,
  parameters: { layout: "padded" },
} satisfies Meta<typeof NavCard>;

export default meta;

type Story = StoryObj<typeof meta>;

// Sidebar is 280px; constrain stories to that width.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="w-[280px]">{children}</div>
);

export const Resting: Story = {
  args: {
    name: "AfrikaBurn",
    done: 3,
    total: 11,
    chip: { label: "T-21d", tone: "cat-bureaucratic" },
    active: false,
  },
  render: (args) => (
    <Frame>
      <NavCard {...args} />
    </Frame>
  ),
};

export const Active: Story = {
  args: {
    name: "AfrikaBurn",
    done: 3,
    total: 11,
    chip: { label: "CLOSING", tone: "warning" },
    active: true,
  },
  render: (args) => (
    <Frame>
      <NavCard {...args} />
    </Frame>
  ),
};

export const ClosingChip: Story = {
  args: {
    name: "Patagonia Trek",
    done: 6,
    total: 9,
    chip: { label: "CLOSING · T-3d", tone: "warning" },
  },
  render: (args) => (
    <Frame>
      <NavCard {...args} />
    </Frame>
  ),
};

export const CompleteChip: Story = {
  args: {
    name: "Visa Renewal",
    done: 8,
    total: 8,
    chip: { label: "COMPLETE", tone: "success" },
  },
  render: (args) => (
    <Frame>
      <NavCard {...args} />
    </Frame>
  ),
};

export const NoChip: Story = {
  args: {
    name: "Backup Mission",
    done: 0,
    total: 5,
  },
  render: (args) => (
    <Frame>
      <NavCard {...args} />
    </Frame>
  ),
};

// All states + chip tones in one column.
export const States: Story = {
  args: { name: "AfrikaBurn", done: 3, total: 11 },
  render: () => (
    <Frame>
      <div className="flex flex-col gap-3">
        <NavCard
          name="AfrikaBurn"
          done={3}
          total={11}
          chip={{ label: "T-21d", tone: "cat-bureaucratic" }}
        />
        <NavCard
          name="AfrikaBurn"
          done={3}
          total={11}
          chip={{ label: "CLOSING", tone: "warning" }}
          active
        />
        <NavCard
          name="Patagonia Trek"
          done={6}
          total={9}
          chip={{ label: "CLOSING · T-3d", tone: "warning" }}
        />
        <NavCard
          name="Visa Renewal"
          done={8}
          total={8}
          chip={{ label: "COMPLETE", tone: "success" }}
        />
        <NavCard name="Backup Mission" done={0} total={5} />
      </div>
    </Frame>
  ),
};
