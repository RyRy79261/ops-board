import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./skeleton";

const meta = {
  title: "Components/Skeleton",
  component: Skeleton,
  parameters: { layout: "padded" },
  argTypes: {
    variant: {
      control: "inline-radio",
      options: ["default", "wide"],
    },
    showStatusBox: { control: "boolean" },
    headerBars: { control: "boolean" },
    count: { control: { type: "number", min: 1, max: 6 } },
    animate: { control: "boolean" },
  },
} satisfies Meta<typeof Skeleton>;

export default meta;

type Story = StoryObj<typeof meta>;

/** default — TaskCard-shaped row: 18px status box + full-width name bar + 2 tag bars. */
export const Default: Story = {
  args: { variant: "default" },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** wide — the showcase `Skeleton · wide`: box + single name bar, Tags row disabled. */
export const Wide: Story = {
  args: { variant: "wide" },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** No status seat — `showStatusBox=false` drops the 18px square (name + tags only). */
export const NoStatusBox: Story = {
  args: { variant: "default", showStatusBox: false },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** Fixed line widths — the TvXzz override (name 240, tags [130]) vs canon fill/[70,90]. */
export const FixedWidths: Story = {
  args: { variant: "default", lineWidths: { name: 240, tags: [130] } },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** count=3 — the list-loading rendering the boards show (three stacked rows). */
export const Stacked: Story = {
  args: { variant: "default", count: 3 },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** With header bars — the loose TvXzz skTitle (190×18) + skSub (120×12) over the list. */
export const WithHeaderBars: Story = {
  args: { variant: "default", count: 3, headerBars: true },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** Static fallback — `animate=false` (also the prefers-reduced-motion behaviour). */
export const Static: Story = {
  args: { variant: "default", count: 3, animate: false },
  render: (args) => (
    <div className="w-80">
      <Skeleton {...args} />
    </div>
  ),
};

/** All variants/states side by side. */
export const States: Story = {
  render: () => (
    <div className="flex flex-wrap items-start gap-8">
      <div className="flex w-72 flex-col gap-2">
        <span className="font-mono text-mono-caption uppercase tracking-wide text-muted-foreground-subtle">
          default
        </span>
        <Skeleton variant="default" />
      </div>
      <div className="flex w-72 flex-col gap-2">
        <span className="font-mono text-mono-caption uppercase tracking-wide text-muted-foreground-subtle">
          wide
        </span>
        <Skeleton variant="wide" />
      </div>
      <div className="flex w-72 flex-col gap-2">
        <span className="font-mono text-mono-caption uppercase tracking-wide text-muted-foreground-subtle">
          no status box
        </span>
        <Skeleton variant="default" showStatusBox={false} />
      </div>
      <div className="flex w-72 flex-col gap-2">
        <span className="font-mono text-mono-caption uppercase tracking-wide text-muted-foreground-subtle">
          list + header bars
        </span>
        <Skeleton variant="default" count={3} headerBars />
      </div>
    </div>
  ),
};
