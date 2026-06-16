import { describe, expect, it } from "vitest";
import { ResearchResult } from "../research";

// ResearchResult.superRefine enforces citation→source referential integrity. The
// key subtlety: citations reference a source's 1-based `index` VALUE, which is
// NOT guaranteed contiguous or in array order — so membership in the declared
// index set is the correct check, not a bound on `sources.length`.

const source = (index: number) => ({
  index,
  domain: "example.org",
  title: "Source",
  url: `https://example.org/${index}`,
});

const base = {
  summary: "A valid kept result.",
  steps: [{ index: 1, text: "Do the thing.", citations: [1] }],
  sources: [source(1)],
};

describe("ResearchResult citation integrity", () => {
  it("accepts citations that point to a real source index", () => {
    expect(ResearchResult.safeParse(base).success).toBe(true);
  });

  it("accepts a citation to a NON-SEQUENTIAL source index (length-bound would wrongly reject)", () => {
    // sources are indexed 1 and 3; a citation of 3 is valid even though
    // sources.length === 2. The old `citation > sources.length` check failed this.
    const result = {
      ...base,
      steps: [{ index: 1, text: "Cite the third source.", citations: [3] }],
      sources: [source(1), source(3)],
    };
    expect(ResearchResult.safeParse(result).success).toBe(true);
  });

  it("rejects a phantom citation that a length-bound would let through", () => {
    // sources are indexed 1 and 3; a citation of 2 has no matching source even
    // though 2 <= sources.length (2). The old check let this broken ref persist.
    const result = {
      ...base,
      steps: [{ index: 1, text: "Cite a missing source.", citations: [2] }],
      sources: [source(1), source(3)],
    };
    expect(ResearchResult.safeParse(result).success).toBe(false);
  });

  it("rejects a citation out of range", () => {
    const result = {
      ...base,
      steps: [{ index: 1, text: "Cite too high.", citations: [9] }],
      sources: [source(1)],
    };
    expect(ResearchResult.safeParse(result).success).toBe(false);
  });

  it("rejects duplicate source indices (a citation must map to one source)", () => {
    const result = {
      ...base,
      steps: [{ index: 1, text: "Cite the ambiguous source.", citations: [1] }],
      sources: [source(1), source(1)],
    };
    expect(ResearchResult.safeParse(result).success).toBe(false);
  });
});
