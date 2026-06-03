import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";

const meta = {
  title: "Components/Card",
  component: Card,
  parameters: { layout: "centered" },
  argTypes: {
    variant: {
      control: "select",
      options: ["default", "closing", "blocked", "not-yet", "closed"],
    },
  },
} satisfies Meta<typeof Card>;

export default meta;

type Story = StoryObj<typeof meta>;

/** The resting surface: uniform 1px $border on the $card fill, sharp radius-0. */
export const Default: Story = {
  args: { variant: "default" },
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>Operation Lighthouse</CardTitle>
        <CardDescription>
          Read-only mission surface. Semantics come from its contents.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body text-muted-foreground">
          The foundational elevated panel every card-like organism composes onto.
        </p>
      </CardContent>
      <CardFooter>
        <span className="font-mono text-mono-caption text-muted-foreground-subtle">
          TARGET: 2026-04-27
        </span>
      </CardFooter>
    </Card>
  ),
};

/** closing — left-2 $warning accent over $card (window approaching its cliff). */
export const Closing: Story = {
  args: { variant: "closing" },
  render: (args) => (
    <Card {...args} className="w-80 p-3.5">
      <p className="text-subtitle-dense font-medium text-foreground">
        Submit visa paperwork
      </p>
      <p className="mt-2 font-mono text-mono-caption text-warning">
        CLOSING · T-5d
      </p>
    </Card>
  ),
};

/** blocked — left-2 subtle accent + opacity .6 (derived from an unmet dependency). */
export const Blocked: Story = {
  args: { variant: "blocked" },
  render: (args) => (
    <Card {...args} className="w-80 p-3.5">
      <p className="text-subtitle-dense font-medium text-foreground">
        Pack field kit
      </p>
      <p className="mt-2 font-mono text-mono-caption text-muted-foreground">
        BLOCKED
      </p>
    </Card>
  ),
};

/** not-yet — left-2 subtle accent + opacity .6 (a not_before start gate). */
export const NotYet: Story = {
  args: { variant: "not-yet" },
  render: (args) => (
    <Card {...args} className="w-80 p-3.5">
      <p className="text-subtitle-dense font-medium text-foreground">
        Board the flight
      </p>
      <p className="mt-2 font-mono text-mono-caption text-muted-foreground-subtle">
        NOT YET · starts 12 Apr
      </p>
    </Card>
  ),
};

/** closed — $muted fill, left-2 $muted-foreground, opacity .55 (window passed). */
export const Closed: Story = {
  args: { variant: "closed" },
  render: (args) => (
    <Card {...args} className="w-80 p-3.5">
      <p className="text-subtitle-dense font-medium text-muted-foreground line-through">
        Register intent
      </p>
      <p className="mt-2 font-mono text-mono-caption text-muted-foreground">
        WINDOW CLOSED · 5 Apr
      </p>
    </Card>
  ),
};

/** asChild — render the surface recipe onto a different element (Slot passthrough). */
export const AsChild: Story = {
  render: () => (
    <Card asChild className="w-80 p-3.5 text-left">
      <button type="button">
        <p className="text-subtitle-dense font-medium text-foreground">
          Pressable surface (asChild &rarr; &lt;button&gt;)
        </p>
        <p className="mt-2 font-mono text-mono-caption text-muted-foreground">
          The Card recipe is forwarded onto the child element.
        </p>
      </button>
    </Card>
  ),
};

/** All five window-state surface recipes side by side. */
export const States: Story = {
  parameters: { layout: "padded" },
  render: () => (
    <div className="flex w-72 flex-col gap-3">
      {(
        [
          ["default", "Open window", "15 Mar"],
          ["closing", "Closing soon", "CLOSING · T-5d"],
          ["blocked", "Blocked by upstream", "BLOCKED"],
          ["not-yet", "Gated start", "NOT YET · starts 12 Apr"],
          ["closed", "Closed window", "WINDOW CLOSED · 5 Apr"],
        ] as const
      ).map(([variant, name, meta]) => (
        <Card key={variant} variant={variant} className="p-3.5">
          <p
            className={
              variant === "closed"
                ? "text-subtitle-dense font-medium text-muted-foreground line-through"
                : "text-subtitle-dense font-medium text-foreground"
            }
          >
            {name}
          </p>
          <div className="mt-2 flex items-center justify-between font-mono text-mono-caption">
            <span className="uppercase tracking-wide text-muted-foreground-subtle">
              {variant}
            </span>
            <span className="text-muted-foreground">{meta}</span>
          </div>
        </Card>
      ))}
    </div>
  ),
};
