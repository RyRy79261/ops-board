import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";

import { RecordingPanel } from "./recording-panel";

/**
 * RecordingPanel — the active voice-capture surface (REC dot + label + mm:ss
 * timer + live Waveform slot), widened on the GZ7xA screen to also host the
 * transcript and the `PARSING INTENT…` cue. Presentational: the real canvas
 * Waveform is passed via `children` from the app; these stories use the
 * built-in `amplitudes` bar fallback.
 */
const meta = {
  title: "Components/Voice/RecordingPanel",
  component: RecordingPanel,
  parameters: { layout: "padded" },
  args: { elapsedLabel: "00:07" },
} satisfies Meta<typeof RecordingPanel>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Width-constrained host so the panel renders at a realistic toast/sheet width. */
function Frame({ children }: { children: React.ReactNode }) {
  return <div className="w-[420px]">{children}</div>;
}

// A canonical 40-bar static amplitude pattern for the fallback waveform.
const BARS = Array.from({ length: 40 }, (_, i) =>
  Math.round(8 + 26 * Math.abs(Math.sin(i * 0.7))),
);
// The GZ7xA inline 8-bar cue.
const BARS_8 = [12, 22, 30, 18, 34, 14, 26, 20];

/** recording (canonical) — $destructive dot + RECORDING + 40-bar $primary waveform. */
export const Recording: Story = {
  args: { state: "recording", amplitudes: BARS },
  render: (args) => (
    <Frame>
      <RecordingPanel {...args} />
    </Frame>
  ),
};

/** transcribing (showcase) — recoloured $warning dot/label, timer 00:12. */
export const Transcribing: Story = {
  args: { state: "transcribing", elapsedLabel: "00:12", amplitudes: BARS },
  render: (args) => (
    <Frame>
      <RecordingPanel {...args} />
    </Frame>
  ),
};

/** parsing-intent — recording chrome + the PARSING INTENT… chip. */
export const Parsing: Story = {
  args: { state: "parsing", elapsedLabel: "00:09", amplitudes: BARS },
  render: (args) => (
    <Frame>
      <RecordingPanel {...args} />
    </Frame>
  ),
};

/**
 * Voice Capture (GZ7xA) — $primary 3px left accent, VOICE CAPTURE header, the
 * inline 8-bar cue, a TRANSCRIPT eyebrow + Mono transcript, and the parsing chip.
 */
export const VoiceCapture: Story = {
  args: {
    state: "parsing",
    elapsedLabel: "00:09",
    amplitudes: BARS_8,
    withAccent: true,
    showTranscript: true,
    transcript:
      "Add a note to the Tankwa permit task — confirm the gate times with CapeNature.",
  },
  render: (args) => (
    <Frame>
      <RecordingPanel {...args} />
    </Frame>
  ),
};

/**
 * Children slot — the panel only supplies chrome; the app paints the real
 * canvas Waveform. Here a placeholder stands in for that `<canvas>`.
 */
export const WithCanvasSlot: Story = {
  args: { state: "recording" },
  render: (args) => (
    <Frame>
      <RecordingPanel {...args}>
        <div className="flex h-[34px] flex-1 items-center justify-center bg-card-elevated font-mono text-mono-caption text-muted-foreground-subtle">
          &lt;canvas&gt; waveform (app-painted)
        </div>
      </RecordingPanel>
    </Frame>
  ),
};

/** All states stacked for review. */
export const States: Story = {
  render: () => (
    <div className="flex w-[420px] flex-col gap-6">
      <RecordingPanel state="recording" elapsedLabel="00:07" amplitudes={BARS} />
      <RecordingPanel
        state="transcribing"
        elapsedLabel="00:12"
        amplitudes={BARS}
      />
      <RecordingPanel state="parsing" elapsedLabel="00:09" amplitudes={BARS} />
      <RecordingPanel
        state="parsing"
        elapsedLabel="00:09"
        amplitudes={BARS_8}
        withAccent
        showTranscript
        transcript="Mark the cardiology follow-up as done."
      />
    </div>
  ),
};
