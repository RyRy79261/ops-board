import {
  Backpack,
  Cpu,
  FileText,
  Inbox,
  Plane,
  Stethoscope,
  Tag,
  type LucideIcon,
} from "lucide-react";

// Shared category metadata for the AI Research components (TaskChip,
// ParsedIntentPanel, DisambiguationPicker). The five-tone taxonomy + its token
// class maps lived duplicated in each; centralised here so adding/retoning a
// category is a one-file change. (§4-authoritative glyphs, mirroring CategoryTag.)
//
// The class strings are FULL literals so Tailwind's content scanner sees them —
// never build a `bg-cat-${x}` string dynamically.

export type Category =
  | "medical"
  | "bureaucratic"
  | "travel"
  | "gear"
  | "tech"
  | "general";

/** The seeded categories, for iteration. `general` is the neutral catch-all
 *  (the seeded default bucket) — toned grey rather than given a bespoke hue. */
export const CATEGORIES: readonly Category[] = [
  "medical",
  "bureaucratic",
  "travel",
  "gear",
  "tech",
  "general",
];

/** Neutral fallback hex (mirrors the `general` seed colour) — the single source
 *  for the grey used when a category has no bespoke tone. */
export const DEFAULT_CATEGORY_COLOR = "#8a8f98";

/** §4 Lucide glyph per category. */
export const CATEGORY_ICON: Record<Category, LucideIcon> = {
  medical: Stethoscope,
  bureaucratic: FileText,
  travel: Plane,
  gear: Backpack,
  tech: Cpu,
  general: Inbox,
};

// Resolve a stored category `lucide_icon` NAME (the DB column) to a component —
// for DATA-DRIVEN categories (the seeds + any user-created), which carry their
// glyph as a string rather than the 5-tone enum. The set is the seed glyphs plus
// the catch-all defaults ("Inbox" = general, "Tag" = created); anything unknown
// falls back to Tag so a custom category always renders SOME icon (LOCKED #6's
// icon channel is never dropped).
const ICON_BY_NAME: Record<string, LucideIcon> = {
  Stethoscope,
  FileText,
  Plane,
  Backpack,
  Cpu,
  Inbox,
  Tag,
};

/** Resolve a Lucide icon name to its component, defaulting to Tag. */
export function iconByName(name: string | null | undefined): LucideIcon {
  return (name && ICON_BY_NAME[name]) || Tag;
}

/** Uppercase display label per category. */
export const CATEGORY_LABEL: Record<Category, string> = {
  medical: "MEDICAL",
  bureaucratic: "BUREAUCRATIC",
  travel: "TRAVEL",
  gear: "GEAR",
  tech: "TECH",
  general: "GENERAL",
};

/** Solid dot fill (`bg-cat-*`) — the 9px category dot. `general` is neutral grey. */
export const CATEGORY_DOT: Record<Category, string> = {
  medical: "bg-cat-medical",
  bureaucratic: "bg-cat-bureaucratic",
  travel: "bg-cat-travel",
  gear: "bg-cat-gear",
  tech: "bg-cat-tech",
  general: "bg-muted-foreground",
};

/** Category-hue text (`text-cat-*`) — captions/labels. `general` is neutral grey. */
export const CATEGORY_TEXT: Record<Category, string> = {
  medical: "text-cat-medical",
  bureaucratic: "text-cat-bureaucratic",
  travel: "text-cat-travel",
  gear: "text-cat-gear",
  tech: "text-cat-tech",
  general: "text-muted-foreground",
};

/** 12%-tint pill (`bg-cat-<x>/12` + `text-cat-<x>`) — the rounded category chips. */
export const CATEGORY_TINT: Record<Category, string> = {
  medical: "bg-cat-medical/12 text-cat-medical",
  bureaucratic: "bg-cat-bureaucratic/12 text-cat-bureaucratic",
  travel: "bg-cat-travel/12 text-cat-travel",
  gear: "bg-cat-gear/12 text-cat-gear",
  tech: "bg-cat-tech/12 text-cat-tech",
  general: "bg-muted-foreground/12 text-muted-foreground",
};
