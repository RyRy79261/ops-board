import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  ToastItem,
  Toaster,
  toast,
  type ToastRecord,
} from "./toast";

/**
 * Toast — the transient result/confirmation surface for voice & MCP commands.
 * The variant/state stories render the presentational <ToastItem/> directly
 * (so each appears statically); the Playground drives the live imperative
 * `toast()` API through a mounted <Toaster/>.
 */
const meta = {
  title: "Components/Toast",
  component: Toaster,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toaster>;

export default meta;

type Story = StoryObj<typeof meta>;

// Static records for the presentational stories (id/duration are inert here —
// nothing dismisses them; ToastItem's timer is skipped for persistent ones).
function record(partial: Omit<ToastRecord, "id">): ToastRecord {
  return { id: 0, ...partial };
}

/* ── Variants ─────────────────────────────────────────────────────────────── */

export const Success: Story = {
  render: () => (
    <ToastItem
      toast={record({
        variant: "success",
        header: "✓ MARKED DONE",
        body: "Cardiology follow-up moved to done.",
        meta: "AUTO-DISMISS · 4S",
        duration: Infinity,
      })}
    />
  ),
};

export const NeedsConfirmation: Story = {
  render: () => (
    <ToastItem
      toast={record({
        variant: "needsConfirmation",
        header: "CONFIRM DELETE",
        body: "Permanently remove “Renew passport”? This cannot be undone.",
        actions: [
          { label: "Delete", intent: "confirm", variant: "destructive" },
          { label: "Cancel", intent: "cancel", variant: "outline" },
        ],
        duration: Infinity,
      })}
    />
  ),
};

export const Disambiguation: Story = {
  render: () => (
    <ToastItem
      toast={record({
        variant: "disambiguation",
        header: "WHICH TASK?",
        body: "Two tasks match “follow up”. Pick one.",
        picks: [
          { name: "Cardiology follow-up", code: "MED" },
          { name: "Supplier follow-up", code: "TECH" },
        ],
        duration: Infinity,
      })}
    />
  ),
};

export const Info: Story = {
  render: () => (
    <ToastItem
      toast={record({
        variant: "info",
        header: "CLOSING THIS WEEK",
        body: "3 tasks have windows that close before Sunday.",
        meta: "ROLE=STATUS · NO BUTTONS",
        duration: Infinity,
      })}
    />
  ),
};

export const Error: Story = {
  render: () => (
    <ToastItem
      toast={record({
        variant: "error",
        header: "COMMAND FAILED",
        body: "Couldn't reach the command endpoint. Try again.",
        meta: "TAP TO DISMISS",
        duration: Infinity,
      })}
    />
  ),
};

/* ── Matrix: every variant stacked ──────────────────────────────────────────── */

export const Matrix: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex flex-col items-end gap-3">
      <ToastItem
        toast={record({
          variant: "success",
          header: "✓ MARKED DONE",
          body: "Cardiology follow-up moved to done.",
          meta: "AUTO-DISMISS · 4S",
          duration: Infinity,
        })}
      />
      <ToastItem
        toast={record({
          variant: "needsConfirmation",
          header: "CONFIRM DELETE",
          body: "Permanently remove “Renew passport”?",
          actions: [
            { label: "Delete", intent: "confirm", variant: "destructive" },
            { label: "Cancel", intent: "cancel", variant: "outline" },
          ],
          duration: Infinity,
        })}
      />
      <ToastItem
        toast={record({
          variant: "disambiguation",
          header: "WHICH TASK?",
          body: "Two tasks match “follow up”.",
          picks: [
            { name: "Cardiology follow-up", code: "MED" },
            { name: "Supplier follow-up", code: "TECH" },
          ],
          duration: Infinity,
        })}
      />
      <ToastItem
        toast={record({
          variant: "info",
          header: "CLOSING THIS WEEK",
          body: "3 tasks have windows that close before Sunday.",
          meta: "ROLE=STATUS · NO BUTTONS",
          duration: Infinity,
        })}
      />
      <ToastItem
        toast={record({
          variant: "error",
          header: "COMMAND FAILED",
          body: "Couldn't reach the command endpoint.",
          meta: "TAP TO DISMISS",
          duration: Infinity,
        })}
      />
    </div>
  ),
};

/* ── Live imperative API + mounted Toaster ──────────────────────────────────── */

export const Playground: Story = {
  parameters: { layout: "fullscreen" },
  render: () => (
    <div className="flex min-h-screen flex-wrap items-start gap-2.5 p-8">
      <Button
        variant="outline"
        onClick={() =>
          toast.success("✓ MARKED DONE", {
            body: "Cardiology follow-up moved to done.",
            meta: "AUTO-DISMISS · 4S",
          })
        }
      >
        Success
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.needsConfirmation("CONFIRM DELETE", {
            body: "Permanently remove “Renew passport”?",
            actions: [
              { label: "Delete", intent: "confirm", variant: "destructive" },
              { label: "Cancel", intent: "cancel", variant: "outline" },
            ],
            onConfirm: () =>
              toast.success("✓ DELETED", { body: "Task removed.", meta: "AUTO-DISMISS · 4S" }),
          })
        }
      >
        Needs confirmation
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.disambiguation("WHICH TASK?", {
            body: "Two tasks match “follow up”. Pick one.",
            picks: [
              { name: "Cardiology follow-up", code: "MED" },
              { name: "Supplier follow-up", code: "TECH" },
            ],
            onPick: (pick) =>
              toast.success("✓ MARKED DONE", {
                body: `${pick.name} moved to done.`,
                meta: "AUTO-DISMISS · 4S",
              }),
          })
        }
      >
        Disambiguation
      </Button>
      <Button
        variant="outline"
        onClick={() =>
          toast.info("CLOSING THIS WEEK", {
            body: "3 tasks have windows that close before Sunday.",
            meta: "ROLE=STATUS · NO BUTTONS",
          })
        }
      >
        Info / query
      </Button>
      <Button
        variant="destructive"
        onClick={() =>
          toast.error("COMMAND FAILED", {
            body: "Couldn't reach the command endpoint. Try again.",
            meta: "TAP TO DISMISS",
          })
        }
      >
        Error
      </Button>
      <Toaster />
    </div>
  ),
};
