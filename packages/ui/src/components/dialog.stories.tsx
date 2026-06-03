import type { Meta, StoryObj } from "@storybook/react-vite";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

/**
 * Dialog — reserved for voice DISAMBIGUATION (>3 matches), never CRUD. The scrim
 * dims the board to `--overlay` (70% near-black); the panel is a sharp radius-0
 * card on `shadow-e2`. Stories use `open` so the overlay renders in the canvas.
 */
const meta = {
  title: "Components/Dialog",
  component: Dialog,
  parameters: { layout: "padded" },
} satisfies Meta<typeof Dialog>;

export default meta;

type Story = StoryObj<typeof meta>;

/** Default — trigger-driven; click to open the disambiguation overlay. */
export const Default: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Open dialog</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Which task?</DialogTitle>
          <DialogDescription>
            More than one task matched &ldquo;the visa one&rdquo;. Pick the
            target you meant.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Renew passport
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Submit visa application
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Book visa interview
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Collect visa from consulate
            </Button>
          </DialogClose>
        </div>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};

/** Open — forced-open so the scrim + panel render in the canvas. */
export const Open: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm target</DialogTitle>
          <DialogDescription>
            Four candidates matched your command. Choose one to continue.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};

/** No footer — body-only panel; the corner close button still dismisses. */
export const NoFooter: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Disambiguation</DialogTitle>
          <DialogDescription>
            Tap a candidate below — no footer actions needed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Medical clearance
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button variant="outline" className="justify-start">
              Travel insurance
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  ),
};

/** No corner close button — forces an explicit footer choice (showCloseButton=false). */
export const NoCloseButton: Story = {
  render: () => (
    <Dialog open>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Pick one</DialogTitle>
          <DialogDescription>
            Dismissable only via the footer action.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton />
      </DialogContent>
    </Dialog>
  ),
};

/** States — the open overlay, with header / body / footer anatomy laid out. */
export const States: Story = {
  render: () => (
    <Dialog open>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Which mission?</DialogTitle>
          <DialogDescription>
            Five missions matched. Pick the one to open.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          {["Patagonia 2026", "Kilimanjaro Q3", "Annapurna Circuit"].map(
            (name) => (
              <DialogClose asChild key={name}>
                <Button variant="outline" className="justify-start">
                  {name}
                </Button>
              </DialogClose>
            ),
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="ghost">Cancel</Button>
          </DialogClose>
          <Button variant="primary">Confirm</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
};
