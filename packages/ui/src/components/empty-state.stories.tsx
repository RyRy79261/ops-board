import type { Meta, StoryObj } from "@storybook/react-vite";
import { CheckCheck, Mic } from "lucide-react";

import { EmptyState } from "./empty-state";

const meta = {
  title: "Components/EmptyState",
  component: EmptyState,
  parameters: { layout: "padded" },
} satisfies Meta<typeof EmptyState>;

export default meta;

type Story = StoryObj<typeof meta>;

// ── Copy variants (voice-first UNION) ───────────────────────────────────────

/** Default: mic-in-hexagon + the canonical no-missions copy on a $card shell. */
export const NoMissions: Story = {
  args: { variant: "no-missions" },
};

/** check-check + the showcase all-closed copy. */
export const NoTasks: Story = {
  args: { variant: "no-tasks" },
};

/** Brief §11 alt no-tasks reading ("No tasks yet — say add a task"). */
export const NoTasksAlt: Story = {
  args: {
    variant: "no-tasks",
    icon: Mic,
    message: "No tasks yet",
    hint: 'say "add a task"',
  },
};

// ── Surface variants ────────────────────────────────────────────────────────

/** Canon: $card fill + 1px $border + e1. */
export const SurfaceCard: Story = {
  args: { variant: "no-missions", surface: "card" },
};

/** TvXzz states gallery: bare $background, no border. */
export const SurfaceBackground: Story = {
  args: { variant: "no-missions", surface: "background" },
};

// ── Hint styles ──────────────────────────────────────────────────────────────

/** `sentence` (default): a single DM Sans hint line. */
export const HintSentence: Story = {
  args: { variant: "no-missions", hintStyle: "sentence" },
};

/** `tokens`: mono `say` lead + a primary-coloured quoted command (TvXzz row). */
export const HintTokens: Story = {
  args: {
    variant: "no-missions",
    surface: "background",
    hintStyle: "tokens",
  },
};

// ── Combined matrix: variant × surface × hintStyle ──────────────────────────

export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-8 bg-background p-6">
      {/* Copy variants on the canonical $card shell, sentence hint. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <EmptyState variant="no-missions" />
        <EmptyState variant="no-tasks" />
      </div>

      {/* The TvXzz gallery rendering: $background surface + mono token hint. */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <EmptyState
          variant="no-missions"
          surface="background"
          hintStyle="tokens"
        />
        <EmptyState
          variant="no-tasks"
          surface="background"
          hintStyle="tokens"
          icon={CheckCheck}
        />
      </div>
    </div>
  ),
};
