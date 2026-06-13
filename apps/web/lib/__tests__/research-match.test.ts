import { describe, it, expect } from "vitest";
import {
  rankTaskMatches,
  toMatchPct,
  type MatchableTask,
} from "../research-match";

// Unit tests for the PURE research target-task matcher (no DB). It ranks a
// mission's tasks against the parse model's fuzzy taskHint so the /research
// surface can show a top match + ordered disambiguation candidates. The ordering
// is load-bearing (it picks the default CUE RESEARCH target), so the rules matter.

const tasks: MatchableTask[] = [
  { id: "t1", name: "Tankwa Land-Use Permit", category: "bureaucratic" },
  { id: "t2", name: "Vehicle Pass Permit", category: "travel" },
  { id: "t3", name: "Burn Permit · Art Grant", category: "gear" },
  { id: "t4", name: "Book flights to Cape Town", category: "travel" },
  { id: "t5", name: "Pack dust-proof gear kit", category: null },
];

describe("rankTaskMatches", () => {
  it("returns every task that shares the hint, best first", () => {
    const ranked = rankTaskMatches("permit", tasks);
    // The three permit tasks match; the flights + gear tasks don't.
    expect(ranked.map((t) => t.id).sort()).toEqual(["t1", "t2", "t3"]);
    // Every returned score is positive and ordered descending.
    for (let i = 1; i < ranked.length; i++) {
      expect(ranked[i - 1]!.score).toBeGreaterThanOrEqual(ranked[i]!.score);
    }
  });

  it("scores an exact (case-insensitive) name match at 1", () => {
    const ranked = rankTaskMatches("tankwa land-use permit", tasks);
    expect(ranked[0]!.id).toBe("t1");
    expect(ranked[0]!.score).toBe(1);
  });

  it("drops tasks with no token overlap", () => {
    const ranked = rankTaskMatches("permit", tasks);
    expect(ranked.find((t) => t.id === "t4")).toBeUndefined();
    expect(ranked.find((t) => t.id === "t5")).toBeUndefined();
  });

  it("ranks a more specific phrase above a bare keyword match", () => {
    const ranked = rankTaskMatches("vehicle pass", tasks);
    // 'vehicle pass' is contained in 'Vehicle Pass Permit' (high), and shares no
    // tokens with the other permits, so t2 is the clear top.
    expect(ranked[0]!.id).toBe("t2");
  });

  it("returns [] for an empty / whitespace hint", () => {
    expect(rankTaskMatches("   ", tasks)).toEqual([]);
    expect(rankTaskMatches("", tasks)).toEqual([]);
  });

  it("is deterministic on ties (stable name order)", () => {
    const a = rankTaskMatches("permit", tasks).map((t) => t.id);
    const b = rankTaskMatches("permit", tasks).map((t) => t.id);
    expect(a).toEqual(b);
  });
});

describe("toMatchPct", () => {
  it("maps a 0–1 score to a clamped 0–100 integer", () => {
    expect(toMatchPct(1)).toBe(100);
    expect(toMatchPct(0)).toBe(0);
    expect(toMatchPct(0.923)).toBe(92);
    expect(toMatchPct(1.5)).toBe(100);
    expect(toMatchPct(-0.2)).toBe(0);
  });
});
