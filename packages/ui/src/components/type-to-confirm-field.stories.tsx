import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TypeToConfirmField } from "./type-to-confirm-field";

const meta = {
  title: "Components/TypeToConfirmField",
  component: TypeToConfirmField,
  parameters: { layout: "padded" },
  args: { value: "", onValueChange: () => {} },
} satisfies Meta<typeof TypeToConfirmField>;

export default meta;

type Story = StoryObj<typeof meta>;

// Interactive: type DELETE to flip the helper line to the matched (success) state.
export const Interactive: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="max-w-md">
        <TypeToConfirmField value={value} onValueChange={setValue} />
      </div>
    );
  },
};

// Custom confirm word.
export const CustomWord: Story = {
  render: () => {
    const [value, setValue] = React.useState("");
    return (
      <div className="max-w-md">
        <TypeToConfirmField
          confirmWord="ERASE"
          value={value}
          onValueChange={setValue}
        />
      </div>
    );
  },
};
