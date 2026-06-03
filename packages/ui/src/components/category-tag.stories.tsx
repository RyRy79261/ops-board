import type { Meta, StoryObj } from "@storybook/react-vite";
import { CategoryTag } from "./category-tag";

const meta = {
  title: "Components/CategoryTag",
  component: CategoryTag,
  parameters: { layout: "centered" },
  args: { category: "medical" },
} satisfies Meta<typeof CategoryTag>;

export default meta;

type Story = StoryObj<typeof meta>;

const CATEGORIES = [
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
] as const;

/** Showcase canonical: tinted rounded-full pill (12% fill + same-hue /40 outline). */
export const Pill: Story = {
  args: { category: "medical", variant: "pill" },
};

/** Dense Category / mobile cards: sharp, borderless, smaller label. */
export const Inline: Story = {
  args: { category: "travel", variant: "inline" },
};

/** Timeline / deps / mobile cards: leading 6px category-coloured dot. */
export const WithDot: Story = {
  args: { category: "bureaucratic", variant: "inline", showDot: true },
};

/** Blocked / not-yet parent → greyed to $muted-foreground (hue dropped). */
export const Dimmed: Story = {
  args: { category: "tech", variant: "inline", showDot: true, dimmed: true },
};

/** All 5 §4 hues as tinted pills (showcase RcvKu). */
export const AllHues: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {CATEGORIES.map((category) => (
        <CategoryTag key={category} category={category} variant="pill" />
      ))}
    </div>
  ),
};

/** Combined matrix: every hue × render mode × showDot/dimmed states. */
export const Matrix: Story = {
  render: () => (
    <div className="flex flex-col gap-6 font-mono text-[11px] text-muted-foreground">
      <div className="flex flex-col gap-2">
        <span className="uppercase tracking-wide">pill</span>
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((category) => (
            <CategoryTag key={category} category={category} variant="pill" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="uppercase tracking-wide">inline (borderless, sharp)</span>
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((category) => (
            <CategoryTag key={category} category={category} variant="inline" />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="uppercase tracking-wide">inline + showDot</span>
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((category) => (
            <CategoryTag
              key={category}
              category={category}
              variant="inline"
              showDot
            />
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <span className="uppercase tracking-wide">dimmed (blocked / not-yet)</span>
        <div className="flex flex-wrap items-center gap-3">
          {CATEGORIES.map((category) => (
            <CategoryTag
              key={category}
              category={category}
              variant="inline"
              showDot
              dimmed
            />
          ))}
        </div>
      </div>
    </div>
  ),
};
