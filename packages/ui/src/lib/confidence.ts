// Shared confidence → tone mapping for the AI Research surface.
//
// A single source of truth for the match-confidence colour banding used by both
// ParsedIntentPanel (the TARGET TASK row's %) and DisambiguationPicker (each
// candidate's %). The desktop board bands the percentage three ways:
//   ≥ 85% → $success  (a confident top match)
//   ≥ 50% → $warning  (a plausible-but-check match)
//   < 50% → $muted-foreground (a long-shot match)
// Keeping this in one place stops the two components drifting apart.

export type ConfidenceTone = "high" | "mid" | "low";

/** Band a 0–100 match percentage into a confidence tone. */
export function confidenceTone(pct: number): ConfidenceTone {
  if (pct >= 85) return "high";
  if (pct >= 50) return "mid";
  return "low";
}

/** Text-colour class per tone (for the rendered "92%" / "64%" / "41%"). */
export const CONFIDENCE_TEXT: Record<ConfidenceTone, string> = {
  high: "text-success",
  mid: "text-warning",
  low: "text-muted-foreground",
};
