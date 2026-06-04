import type { Meta, StoryObj } from "@storybook/react-vite";

import { Sidebar } from "./sidebar";
import { NavCard } from "./nav-card";
import { EmptyState } from "./empty-state";

const meta = {
  title: "Components/Sidebar",
  component: Sidebar,
  parameters: { layout: "fullscreen" },
  args: { children: null },
} satisfies Meta<typeof Sidebar>;

export default meta;

type Story = StoryObj<typeof meta>;

// Constrain the rail height so the scroll region is visible in the story.
const Frame = ({ children }: { children: React.ReactNode }) => (
  <div className="h-[560px]">{children}</div>
);

/** The four-mission rail with the active mission selected (boards specimen). */
export const FourMissions: Story = {
  render: () => (
    <Frame>
      <Sidebar>
        <NavCard
          name="AfrikaBurn 2026"
          done={4}
          total={10}
          chip={{ label: "1 CLOSED · 2 CLOSING", tone: "warning" }}
          active
        />
        <NavCard
          name="Patagonia Trek"
          done={6}
          total={9}
          chip={{ label: "ON TRACK", tone: "cat-bureaucratic" }}
        />
        <NavCard
          name="Schengen Renewal"
          done={8}
          total={8}
          chip={{ label: "COMPLETE", tone: "success" }}
        />
        <NavCard name="Kilimanjaro" done={1} total={7} />
      </Sidebar>
    </Frame>
  ),
};

/** Single active mission (the lean Category desktop rendering). */
export const SingleMission: Story = {
  render: () => (
    <Frame>
      <Sidebar>
        <NavCard
          name="AfrikaBurn 2026"
          done={3}
          total={11}
          chip={{ label: "T-3d", tone: "warning" }}
          active
        />
      </Sidebar>
    </Frame>
  ),
};

/** Custom header label. */
export const CustomTitle: Story = {
  render: () => (
    <Frame>
      <Sidebar title="EXPEDITIONS">
        <NavCard name="AfrikaBurn 2026" done={3} total={11} active />
        <NavCard name="Patagonia Trek" done={6} total={9} />
      </Sidebar>
    </Frame>
  ),
};

/** Empty rail — no missions yet. */
export const Empty: Story = {
  render: () => (
    <Frame>
      <Sidebar>
        <EmptyState
          variant="no-missions"
          surface="background"
          className="border-0 shadow-none"
        />
      </Sidebar>
    </Frame>
  ),
};
