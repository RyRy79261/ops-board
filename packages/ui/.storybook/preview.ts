import type { Preview } from "@storybook/react-vite";
import "../src/styles/globals.css";

// Dark-only: globals.css @layer base paints body bg-background/text-foreground,
// so every story renders on the near-black tactical canvas without a decorator.
const preview: Preview = {
  parameters: {
    layout: "fullscreen",
    backgrounds: { disable: true },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },
};

export default preview;
