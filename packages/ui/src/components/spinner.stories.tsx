import type { Meta, StoryObj } from "@storybook/react-vite";
import { Spinner } from "./spinner";

const meta = {
  title: "Components/Spinner",
  component: Spinner,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Spinner>;

export default meta;

type Story = StoryObj<typeof meta>;

/** processing · default — 20px orange loader + PROCESSING COMMAND… label (library def). */
export const Default: Story = {
  args: { label: "PROCESSING COMMAND…" },
};

/** syncing — the showcase `Spinner · syncing` copy variant. */
export const Syncing: Story = {
  args: { label: "SYNCING MISSION…" },
};

/** label-less — icon-only 30px loader for the voice FAB processing cell (showLabel=false). */
export const LabelLess: Story = {
  args: { showLabel: false, size: 30, "aria-label": "Processing command" },
};

/** muted tone — softened glyph for low-emphasis transient ops. */
export const Muted: Story = {
  args: { label: "SYNCING MISSION…", tone: "muted" },
};

/** arc glyph — the AI Research partial-ring ellipse reused across job panels. */
export const Arc: Story = {
  args: { glyph: "arc", label: "RESEARCHING…" },
};

/** size: 20 inline vs ~30 voice-FAB cell. */
export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-8">
      <Spinner label="20PX" size={20} />
      <Spinner label="30PX" size={30} />
    </div>
  ),
};

/** All glyphs × tones × the two key sizes, plus the icon-only state. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-caption text-muted-foreground-subtle">
          loader · primary
        </span>
        <Spinner glyph="loader" tone="primary" label="PROCESSING COMMAND…" />
        <Spinner glyph="loader" tone="primary" label="SYNCING MISSION…" size={30} />
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-caption text-muted-foreground-subtle">
          loader · muted
        </span>
        <Spinner glyph="loader" tone="muted" label="PROCESSING COMMAND…" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-caption text-muted-foreground-subtle">
          arc · primary
        </span>
        <Spinner glyph="arc" tone="primary" label="RESEARCHING…" />
      </div>
      <div className="flex flex-col gap-3">
        <span className="font-mono text-mono-caption text-muted-foreground-subtle">
          label-less (FAB cell)
        </span>
        <Spinner showLabel={false} size={30} aria-label="Processing command" />
      </div>
    </div>
  ),
};
