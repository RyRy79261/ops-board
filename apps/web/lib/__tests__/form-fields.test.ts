import { describe, it, expect } from "vitest";
import { z } from "zod";
import {
  DateField,
  PatchDateField,
  NameField,
  isRealCalendarDate,
} from "../form-fields";

describe("isRealCalendarDate", () => {
  it("accepts real dates and rejects impossible / malformed ones", () => {
    expect(isRealCalendarDate("2026-03-15")).toBe(true);
    expect(isRealCalendarDate("2026-02-28")).toBe(true);
    expect(isRealCalendarDate("2026-02-30")).toBe(false); // not a real day
    expect(isRealCalendarDate("2026-13-01")).toBe(false); // not a real month
    expect(isRealCalendarDate("2026-3-15")).toBe(false); // unpadded
    expect(isRealCalendarDate("nope")).toBe(false);
  });
});

describe("PatchDateField — PATCH semantics (update path)", () => {
  const obj = z.object({ targetDate: PatchDateField });

  it("REGRESSION (data-loss): an ABSENT key parses to undefined — leave unchanged, NOT null", () => {
    // This is the exact shape a name-only mission edit sends. With the old
    // DateField (transform outside .optional()) this coerced to null and the
    // mutation wrote target_date = NULL, silently wiping the date.
    const r = obj.parse({});
    expect(r.targetDate).toBeUndefined();
  });

  it("an explicit empty string clears the date (→ null)", () => {
    expect(obj.parse({ targetDate: "" }).targetDate).toBeNull();
  });

  it("an explicit null clears the date (→ null)", () => {
    expect(obj.parse({ targetDate: null }).targetDate).toBeNull();
  });

  it("a valid date passes through unchanged", () => {
    expect(obj.parse({ targetDate: "2026-03-15" }).targetDate).toBe(
      "2026-03-15",
    );
  });

  it("an impossible date is rejected", () => {
    expect(() => obj.parse({ targetDate: "2026-02-30" })).toThrow();
  });
});

describe("DateField — CREATE semantics", () => {
  const obj = z.object({ targetDate: DateField });

  it("an absent key becomes null (a new row legitimately has no date)", () => {
    expect(obj.parse({}).targetDate).toBeNull();
  });

  it("empty string becomes null", () => {
    expect(obj.parse({ targetDate: "" }).targetDate).toBeNull();
  });

  it("a valid date passes through; an impossible one is rejected", () => {
    expect(obj.parse({ targetDate: "2026-03-15" }).targetDate).toBe(
      "2026-03-15",
    );
    expect(() => obj.parse({ targetDate: "2026-02-30" })).toThrow();
  });
});

describe("NameField", () => {
  it("trims and requires non-empty", () => {
    expect(NameField.parse("  Trip  ")).toBe("Trip");
    expect(() => NameField.parse("   ")).toThrow();
  });
});
