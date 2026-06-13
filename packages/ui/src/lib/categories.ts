import {
  Backpack,
  Cpu,
  FileText,
  Plane,
  Stethoscope,
  type LucideIcon,
} from "lucide-react";

// Shared category metadata for the AI Research components (TaskChip,
// ParsedIntentPanel, DisambiguationPicker). The five-tone taxonomy + its token
// class maps lived duplicated in each; centralised here so adding/retoning a
// category is a one-file change. (§4-authoritative glyphs, mirroring CategoryTag.)
//
// The class strings are FULL literals so Tailwind's content scanner sees them —
// never build a `bg-cat-${x}` string dynamically.

export type Category = "medical" | "bureaucratic" | "travel" | "gear" | "tech";

/** The five seeded categories, for iteration. */
export const CATEGORIES: readonly Category[] = [
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
];

/** §4 Lucide glyph per category. */
export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  medical: Stethoscope,
  bureaucratic: FileText,
  travel: Plane,
  gear: Backpack,
  tech: Cpu,
};

/** Uppercase display label per category. */
export const CATEGORY_LABEL: Record<Category, string> = {
  medical: "MEDICAL",
  bureaucratic: "BUREAUCRATIC",
  travel: "TRAVEL",
  gear: "GEAR",
  tech: "TECH",
};

/** Solid dot fill (`bg-cat-*`) — the 9px category dot. */
export const CATEGORY_DOT: Record<Category, string> = {
  medical: "bg-cat-medical",
  bureaucratic: "bg-cat-bureaucratic",
  travel: "bg-cat-travel",
  gear: "bg-cat-gear",
  tech: "bg-cat-tech",
};

/** Category-hue text (`text-cat-*`) — captions/labels. */
export const CATEGORY_TEXT: Record<Category, string> = {
  medical: "text-cat-medical",
  bureaucratic: "text-cat-bureaucratic",
  travel: "text-cat-travel",
  gear: "text-cat-gear",
  tech: "text-cat-tech",
};

/** 12%-tint pill (`bg-cat-<x>/12` + `text-cat-<x>`) — the rounded category chips. */
export const CATEGORY_TINT: Record<Category, string> = {
  medical: "bg-cat-medical/12 text-cat-medical",
  bureaucratic: "bg-cat-bureaucratic/12 text-cat-bureaucratic",
  travel: "bg-cat-travel/12 text-cat-travel",
  gear: "bg-cat-gear/12 text-cat-gear",
  tech: "bg-cat-tech/12 text-cat-tech",
};
