import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingScreen } from "./loading-screen";

const meta = {
  title: "Components/LoadingScreen",
  component: LoadingScreen,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof LoadingScreen>;

export default meta;

type Story = StoryObj<typeof meta>;

// app-shell — 220px sidebar skeleton + main column (the first-paint default).
export const AppShell: Story = {
  args: { showSidebar: true, cardCount: 3 },
};

// list-only — no sidebar (the board/list first-paint variant).
export const ListOnly: Story = {
  args: { showSidebar: false, cardCount: 4 },
};
