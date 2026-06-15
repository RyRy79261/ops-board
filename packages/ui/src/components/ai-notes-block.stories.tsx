import type { Meta, StoryObj } from "@storybook/react-vite";
import { AINotesBlock } from "./ai-notes-block";

// Desktop fixture — the §2 B2 `L6TvtJ` Tankwa land-use read-out (5 steps, 3
// sources, the desktop step→citation map [1] / [1][2] / [3] / [2] / [1][2]).
const DESKTOP_STEPS = [
  {
    index: 1,
    text: "Open the CapeNature land-use application portal and select the Tankwa Karoo regional office as the responsible authority.",
    citations: [1],
  },
  {
    index: 2,
    text: "Attach the AfrikaBurn 2026 official event authorisation letter plus the participant land-use motivation form.",
    citations: [1, 2],
  },
  {
    index: 3,
    text: "Pay the environmental impact assessment levy via SARS eFiling and retain the payment reference (PRN).",
    citations: [3],
  },
  {
    index: 4,
    text: "Submit the completed application at least 10 working days before the target date to clear regional review.",
    citations: [2],
  },
  {
    index: 5,
    text: "On approval, download the gate-access permit and record the permit number against this task.",
    citations: [1, 2],
  },
];

const DESKTOP_SOURCES = [
  {
    index: 1,
    domain: "tankwatown.org",
    title: "Tankwa Town — land-use & gate permits",
    url: "https://tankwatown.org",
    faviconTone: "bg-cat-bureaucratic",
  },
  {
    index: 2,
    domain: "capenature.co.za",
    title: "Protected-area land-use applications",
    url: "https://capenature.co.za",
    faviconTone: "bg-cat-travel",
  },
  {
    index: 3,
    domain: "sars.gov.za",
    title: "eFiling — environmental levy payments",
    url: "https://sars.gov.za",
    faviconTone: "bg-primary",
  },
];

// Mobile fixture — §3 B2 `gfPA3`: different copy, inline-bracket citations
// (step 3 has none), and a different source set (afrikaburn.org replaces sars).
const MOBILE_STEPS = [
  {
    index: 1,
    text: "Create a CapeNature online profile and start a new land-use application.",
    citations: [1],
  },
  {
    index: 2,
    text: "Upload your ID, vehicle details and AfrikaBurn ticket confirmation.",
    citations: [2],
  },
  {
    index: 3,
    text: "Pay the R150 conservation levy by EFT and attach proof of payment.",
    citations: [],
  },
  {
    index: 4,
    text: "Submit at least 30 days before 27 Apr 2026 to allow processing.",
    citations: [1],
  },
  {
    index: 5,
    text: "Save the emailed permit PDF — you must show it at the Tankwa gate.",
    citations: [3],
  },
];

const MOBILE_SOURCES = [
  {
    index: 1,
    domain: "capenature.co.za",
    title: "Land-use permits & conservation levies",
    url: "https://capenature.co.za",
    faviconTone: "bg-cat-travel",
  },
  {
    index: 2,
    domain: "afrikaburn.org",
    title: "Tickets & Tankwa permits FAQ",
    url: "https://afrikaburn.org",
    faviconTone: "bg-primary",
  },
  {
    index: 3,
    domain: "tankwatown.org",
    title: "Getting to the Tankwa Karoo",
    url: "https://tankwatown.org",
    faviconTone: "bg-warning",
  },
];

const meta = {
  title: "Components/AI Research/AINotesBlock",
  component: AINotesBlock,
  parameters: { layout: "padded" },
  args: {
    noteCount: 5,
    timestamp: "2026-06-03 14:22",
    isNew: true,
    summary:
      "Tankwa land-use happens through CapeNature — submit the regional land-use application with the AfrikaBurn event letter, settle the SARS levy, then await the gate-access permit. Allow ~10 working days.",
    steps: DESKTOP_STEPS,
    sources: DESKTOP_SOURCES,
    onKeep: () => {},
    onDismiss: () => {},
    onViewSources: () => {},
    variant: "desktop",
  },
} satisfies Meta<typeof AINotesBlock>;

export default meta;

type Story = StoryObj<typeof meta>;

// Desktop — chip citations + inline affordances (KEEP / DISMISS / VIEW SOURCES).
export const Desktop: Story = {
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

// Not-new — same desktop read-out without the NEW pill.
export const DesktopNotNew: Story = {
  args: { isNew: false },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};

// Mobile — inline-bracket citations, split timestamp Date row, stacked
// affordances with full-width OPEN ALL SOURCES.
export const Mobile: Story = {
  args: {
    variant: "mobile",
    summary:
      "The Tankwa Karoo land-use permit is issued by CapeNature. Apply at least 30 days before arrival and carry the PDF to the gate.",
    steps: MOBILE_STEPS,
    sources: MOBILE_SOURCES,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 390 }}>
        <Story />
      </div>
    ),
  ],
};

// Read-only — already-kept notes: omitting onKeep/onDismiss drops the whole
// affordance row. This is what the board "✦ N" research link lands on.
export const ReadOnly: Story = {
  args: {
    isNew: false,
    onKeep: undefined,
    onDismiss: undefined,
    onViewSources: undefined,
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: 720 }}>
        <Story />
      </div>
    ),
  ],
};
