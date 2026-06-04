import type { Meta, StoryObj } from "@storybook/react-vite";

import { VoiceFAB } from "./voice-fab";

/**
 * VoiceFAB — the single floating mic affordance and entry point to the voice
 * command pipeline. Presentational + controlled: the app drives `state` and the
 * pointer/press handlers (recorder wiring + `/api/voice/command` POST live in
 * the app, not here). The state cells below mirror the T2BChB gallery; the
 * shipped artifact is ONE fixed-position FAB rendering a single state at a time.
 */
const meta = {
  title: "Components/Voice/VoiceFAB",
  component: VoiceFAB,
  parameters: { layout: "centered" },
  args: { state: "idle" },
} satisfies Meta<typeof VoiceFAB>;

export default meta;

type Story = StoryObj<typeof meta>;

/** idle — $primary button, lucide `mic`, static $primary pulse ring. */
export const Idle: Story = { args: { state: "idle" } };

/** requesting — mic-permission pending (brief §11, no board art): spinner + ALLOW MICROPHONE…. */
export const Requesting: Story = { args: { state: "requesting" } };

/** recording — $destructive button, `square` glyph, animated red pulse ring. */
export const Recording: Story = { args: { state: "recording" } };

/** processing — muted bordered well, orange spinning `loader`, TRANSCRIBING…. */
export const Processing: Story = { args: { state: "processing" } };

/** error — muted button + $destructive border, `triangle-alert`, red underline, role=alert. */
export const Error: Story = { args: { state: "error" } };

/** All five lifecycle states as a documentation row (the T2BChB specimen gallery). */
export const States: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap items-start gap-12">
      <VoiceFAB state="idle" />
      <VoiceFAB state="requesting" />
      <VoiceFAB state="recording" />
      <VoiceFAB state="processing" />
      <VoiceFAB state="error" />
    </div>
  ),
};

/** Desktop diameter (64px) vs mobile (56px, default) vs the 72px gallery zoom. */
export const Sizes: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-wrap items-start gap-12">
      <VoiceFAB state="idle" size={56} hint="56PX · MOBILE" />
      <VoiceFAB state="idle" size={64} hint="64PX · DESKTOP" />
      <VoiceFAB state="recording" size={72} hint="72PX · GALLERY" />
    </div>
  ),
};

/**
 * Fixed-position product use — bottom-right on desktop AND mobile (brief §11.1),
 * z-150, with a mobile safe-area inset. Hint suppressed (`hint={null}`) in the
 * fixed product placement; the consumer owns the fixed wrapper classes.
 */
export const Fixed: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="relative h-[420px] w-full bg-background">
      <VoiceFAB
        state="idle"
        hint={null}
        className="fixed bottom-0 right-0 z-[150] m-4 pb-[env(safe-area-inset-bottom)]"
      />
    </div>
  ),
};
