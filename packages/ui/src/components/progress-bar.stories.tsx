import type { Meta, StoryObj } from "@storybook/react-vite";

import { ProgressBar } from "./progress-bar";

const meta = {
  title: "Components/ProgressBar",
  component: ProgressBar,
  parameters: { layout: "centered" },
} satisfies Meta<typeof ProgressBar>;

export default meta;

type Story = StoryObj<typeof meta>;

/** A fixed-width frame so the fill-container bar has a track to fill. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-80 bg-card p-4">{children}</div>;
}

// ── Canonical §9 window-state mode: done(success) + closing(warning) + blocked(destructive)
export const Window: Story = {
  render: () => (
    <Frame>
      <ProgressBar
        total={11}
        segments={[
          { tone: "success", value: 3 },
          { tone: "warning", value: 2 },
          { tone: "destructive", value: 3 },
        ]}
        label="3 done, 2 closing, 3 blocked of 11"
      />
    </Frame>
  ),
};

// ── Dependencies board divergence: done(success) + active(primary) over a $muted track,
//    with an explicit $border remainder (mode='progress').
export const ProgressMode: Story = {
  render: () => (
    <Frame>
      <ProgressBar
        mode="progress"
        total={12}
        remainderTone="border"
        segments={[
          { tone: "success", value: 6 },
          { tone: "primary", value: 2 },
        ]}
        label="6 done, 2 in progress of 12"
      />
    </Frame>
  ),
};

// ── Remainder tones: track ($card-elevated) | border ($border) | muted ($muted).
export const RemainderTones: Story = {
  render: () => (
    <Frame>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-micro text-muted-foreground-subtle">
            track ($card-elevated) — default
          </span>
          <ProgressBar
            total={11}
            segments={[
              { tone: "success", value: 3 },
              { tone: "warning", value: 2 },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-micro text-muted-foreground-subtle">
            border ($border) — mobile + Deps
          </span>
          <ProgressBar
            total={11}
            gap={2}
            remainderTone="border"
            segments={[
              { tone: "success", value: 4 },
              { tone: "warning", value: 1 },
            ]}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="font-mono text-micro text-muted-foreground-subtle">
            muted ($muted) — Timeline detail bMFeK, h6
          </span>
          <ProgressBar
            total={10}
            height={6}
            gap={2}
            remainderTone="muted"
            segments={[
              { tone: "success", value: 4 },
              { tone: "warning", value: 4 },
            ]}
          />
        </div>
      </div>
    </Frame>
  ),
};

// ── all-done: a single full success segment.
export const AllDone: Story = {
  render: () => (
    <Frame>
      <ProgressBar
        total={8}
        segments={[{ tone: "success", value: 8 }]}
        label="8 of 8 done — complete"
      />
    </Frame>
  ),
};

// ── empty: no segments → bare track.
export const Empty: Story = {
  render: () => (
    <Frame>
      <ProgressBar total={11} segments={[]} label="0 of 11 done" />
    </Frame>
  ),
};

// ── indeterminate AI-research sweep (CSS-only; segments ignored).
export const Indeterminate: Story = {
  render: () => (
    <Frame>
      <ProgressBar indeterminate label="Researching…" />
    </Frame>
  ),
};

// ── Combined matrix of the key variants/states.
export const States: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-5 bg-card p-4">
      {(
        [
          {
            cap: "window — done/closing/blocked",
            el: (
              <ProgressBar
                total={11}
                segments={[
                  { tone: "success", value: 3 },
                  { tone: "warning", value: 2 },
                  { tone: "destructive", value: 3 },
                ]}
              />
            ),
          },
          {
            cap: "window — gap 2, $border remainder (mobile)",
            el: (
              <ProgressBar
                total={11}
                gap={2}
                remainderTone="border"
                segments={[
                  { tone: "success", value: 4 },
                  { tone: "warning", value: 2 },
                ]}
              />
            ),
          },
          {
            cap: "progress mode — success/primary on $muted",
            el: (
              <ProgressBar
                mode="progress"
                total={12}
                remainderTone="border"
                segments={[
                  { tone: "success", value: 6 },
                  { tone: "primary", value: 2 },
                ]}
              />
            ),
          },
          {
            cap: "detail header — h6, $muted Seg Rest, gap 2",
            el: (
              <ProgressBar
                total={10}
                height={6}
                gap={2}
                remainderTone="muted"
                segments={[
                  { tone: "success", value: 4 },
                  { tone: "warning", value: 4 },
                ]}
              />
            ),
          },
          {
            cap: "all-done",
            el: (
              <ProgressBar
                total={8}
                segments={[{ tone: "success", value: 8 }]}
              />
            ),
          },
          { cap: "empty — bare track", el: <ProgressBar total={11} /> },
          {
            cap: "indeterminate (AI research)",
            el: <ProgressBar indeterminate />,
          },
        ] as const
      ).map(({ cap, el }) => (
        <div key={cap} className="flex flex-col gap-1.5">
          <span className="font-mono text-micro text-muted-foreground-subtle">
            {cap}
          </span>
          {el}
        </div>
      ))}
    </div>
  ),
};
