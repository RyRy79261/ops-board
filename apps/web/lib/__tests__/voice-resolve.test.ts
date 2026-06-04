import { describe, it, expect } from "vitest";
import { resolveHint, type Resolvable } from "../voice-resolve";

// Unit tests for the PURE voice hint resolver (no DB). The executor maps a
// classifier *Hint to a real entity id through this; the three verdicts (one /
// none / many) drive execute vs. clarify vs. disambiguate, so the matching rules
// are load-bearing for the whole voice pipeline's correctness.

const tasks: Resolvable[] = [
  { id: "t1", name: "Cardiology follow-up", code: "MED" },
  { id: "t2", name: "Supplier follow-up — LED panels", code: "TECH" },
  { id: "t3", name: "Book flights to Cape Town", code: "TRAVEL" },
  { id: "t4", name: "MEDEVAC insurance", code: "MED" },
];

describe("resolveHint", () => {
  it("resolves an exact (case-insensitive) name to one match", () => {
    const r = resolveHint("cardiology follow-up", tasks);
    expect(r.status).toBe("one");
    if (r.status === "one") expect(r.match.id).toBe("t1");
  });

  it("normalizes surrounding + internal whitespace", () => {
    const r = resolveHint("   MEDEVAC    insurance ", tasks);
    expect(r.status).toBe("one");
    if (r.status === "one") expect(r.match.id).toBe("t4");
  });

  it("an EXACT match wins over partial substring matches", () => {
    // "MEDEVAC insurance" exactly matches t4; it also `contains`-matches nothing
    // else, but the point is exact resolution short-circuits the contains pass.
    const r = resolveHint("MEDEVAC insurance", tasks);
    expect(r.status).toBe("one");
    if (r.status === "one") expect(r.match.id).toBe("t4");
  });

  it("returns `many` when a substring matches multiple candidates", () => {
    const r = resolveHint("follow-up", tasks);
    expect(r.status).toBe("many");
    if (r.status === "many") {
      expect(r.matches.map((m) => m.id).sort()).toEqual(["t1", "t2"]);
    }
  });

  it("returns `one` for an unambiguous substring", () => {
    const r = resolveHint("flights", tasks);
    expect(r.status).toBe("one");
    if (r.status === "one") expect(r.match.id).toBe("t3");
  });

  it("matches when a NAME is contained in the spoken hint (reverse contains)", () => {
    // The user said more than the stored name; the stored name is a substring.
    const r = resolveHint("please book flights to cape town tomorrow", tasks);
    expect(r.status).toBe("one");
    if (r.status === "one") expect(r.match.id).toBe("t3");
  });

  it("returns `none` when nothing matches", () => {
    expect(resolveHint("passport renewal", tasks).status).toBe("none");
  });

  it("returns `none` for an empty / whitespace-only hint", () => {
    expect(resolveHint("", tasks).status).toBe("none");
    expect(resolveHint("   ", tasks).status).toBe("none");
  });

  it("returns `none` against an empty candidate set", () => {
    expect(resolveHint("anything", []).status).toBe("none");
  });

  it("returns `many` when two candidates share the SAME exact name", () => {
    const dupes: Resolvable[] = [
      { id: "a", name: "Permit", code: "BUR" },
      { id: "b", name: "Permit", code: "TRAVEL" },
    ];
    const r = resolveHint("permit", dupes);
    expect(r.status).toBe("many");
    if (r.status === "many") {
      expect(r.matches.map((m) => m.id).sort()).toEqual(["a", "b"]);
    }
  });
});
