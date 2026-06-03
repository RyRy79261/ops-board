import { describe, expect, it } from "vitest";

import {
  CLOSING_THRESHOLD_DAYS,
  windowState,
  windowStateDetail,
} from "../window-state";
import { instantInTz, makeTask } from "./factory";

const SA = "Africa/Johannesburg"; // UTC+2, no DST
const DE = "Europe/Berlin"; // UTC+1 / UTC+2 (CEST), has DST

describe("CLOSING_THRESHOLD_DAYS", () => {
  it("is pinned to 7", () => {
    expect(CLOSING_THRESHOLD_DAYS).toBe(7);
  });
});

describe("windowState — open", () => {
  it("is open when there is no cliff, no not_before, not blocked", () => {
    const now = instantInTz("2026-06-01T10:00:00", SA);
    expect(windowState(now, makeTask(), SA)).toBe("open");
  });

  it("is open when the cliff is far beyond the closing threshold", () => {
    const now = instantInTz("2026-06-01T10:00:00", SA);
    const task = makeTask({ too_late_by: "2026-12-31" });
    expect(windowState(now, task, SA)).toBe("open");
  });

  it("is open exactly one day past the closing threshold", () => {
    // now = 2026-06-01; cliff = 2026-06-09 → 8 whole days away → still open.
    const now = instantInTz("2026-06-01T10:00:00", SA);
    const task = makeTask({ too_late_by: "2026-06-09" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("open");
    expect(detail.daysUntilClose).toBe(8);
  });
});

describe("windowState — closing", () => {
  it("is closing when the cliff is within the threshold", () => {
    // now = 2026-06-01 10:00; cliff end-of-day 2026-06-05 → ~4 days away.
    const now = instantInTz("2026-06-01T10:00:00", SA);
    const task = makeTask({ too_late_by: "2026-06-05" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("closing");
    expect(detail.daysUntilClose).toBe(4);
  });

  it("is closing at exactly the threshold boundary (T-7d)", () => {
    // now = 2026-06-01 00:00:00.001; cliff end-of-day 2026-06-08 → 7 days.
    const now = instantInTz("2026-06-01T00:00:00.001", SA);
    const task = makeTask({ too_late_by: "2026-06-08" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.daysUntilClose).toBe(7);
    expect(detail.state).toBe("closing");
  });

  it("is closing on the cliff day itself (T-0, before end-of-day)", () => {
    const now = instantInTz("2026-06-05T12:00:00", SA);
    const task = makeTask({ too_late_by: "2026-06-05" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("closing");
    expect(detail.daysUntilClose).toBe(0);
  });
});

describe("windowState — closed boundary (LOCAL end-of-day)", () => {
  it("is NOT closed one ms before local end-of-day, IS closed one ms after [SA]", () => {
    const task = makeTask({ too_late_by: "2026-06-05" });
    // 23:59:59.999 SA is the last open instant.
    const lastOpen = instantInTz("2026-06-05T23:59:59.999", SA);
    expect(windowState(lastOpen, task, SA)).toBe("closing");
    // One ms later → closed.
    expect(windowState(lastOpen + 1, task, SA)).toBe("closed");
  });

  it("is NOT closed one ms before local end-of-day, IS closed one ms after [DE]", () => {
    const task = makeTask({ too_late_by: "2026-06-05" });
    const lastOpen = instantInTz("2026-06-05T23:59:59.999", DE);
    expect(windowState(lastOpen, task, DE)).toBe("closing");
    expect(windowState(lastOpen + 1, task, DE)).toBe("closed");
  });

  it("the SA and DE end-of-day instants differ by the zone offset (1h in summer)", () => {
    // June: SA = UTC+2, Berlin = UTC+2 (CEST) → same; pick a winter date to differ.
    const taskJan = makeTask({ too_late_by: "2026-01-15" });
    const saEnd = instantInTz("2026-01-15T23:59:59.999", SA);
    const deEnd = instantInTz("2026-01-15T23:59:59.999", DE);
    // Jan: SA = UTC+2, Berlin = UTC+1 → Berlin's local end-of-day is 1h LATER (UTC).
    expect(deEnd - saEnd).toBe(3_600_000);
    // A UTC instant that is past SA's end-of-day but before DE's is closed in SA,
    // still open (closing) in DE — the timezone PARAMETER decides, not the host.
    const between = saEnd + 1_000;
    expect(windowState(between, taskJan, SA)).toBe("closed");
    expect(windowState(between, taskJan, DE)).toBe("closing");
  });

  it("handles a DST-affected cliff date in Berlin (spring forward weekend)", () => {
    // DST starts 2026-03-29 in Berlin (clocks 02:00→03:00). End-of-day is at
    // 23:59 — well clear of the gap — so the boundary stays well-defined.
    const task = makeTask({ too_late_by: "2026-03-29" });
    const lastOpen = instantInTz("2026-03-29T23:59:59.999", DE);
    expect(windowState(lastOpen, task, DE)).toBe("closing");
    expect(windowState(lastOpen + 1, task, DE)).toBe("closed");
  });
});

describe("windowState — not-yet (not_before)", () => {
  it("is not-yet when now is before the local start-of-day of not_before", () => {
    const now = instantInTz("2026-06-01T10:00:00", SA);
    const task = makeTask({ not_before: "2026-06-10" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("not-yet");
    expect(detail.reason).toBe("not_before");
  });

  it("becomes open once now reaches the local start-of-day of not_before", () => {
    const startOfDay = instantInTz("2026-06-10T00:00:00.000", SA);
    const task = makeTask({ not_before: "2026-06-10" });
    expect(windowState(startOfDay, task, SA)).toBe("open");
    // One ms before start-of-day is still not-yet.
    expect(windowState(startOfDay - 1, task, SA)).toBe("not-yet");
  });
});

describe("windowState — not-yet (blocked)", () => {
  it("is not-yet/blocked when the task is blocked", () => {
    const now = instantInTz("2026-06-01T10:00:00", SA);
    const task = makeTask({ blocked: true });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("not-yet");
    expect(detail.reason).toBe("blocked");
  });
});

describe("windowState — precedence (design-brief §9)", () => {
  // closed > not-yet(blocked) > not-yet(not_before) > closing > open.
  const now = instantInTz("2026-06-10T10:00:00", SA);

  it("closed beats blocked", () => {
    const task = makeTask({ too_late_by: "2026-06-05", blocked: true });
    expect(windowStateDetail(now, task, SA).reason).toBe("closed");
  });

  it("closed beats not_before", () => {
    const task = makeTask({
      too_late_by: "2026-06-05",
      not_before: "2026-06-20",
    });
    expect(windowStateDetail(now, task, SA).reason).toBe("closed");
  });

  it("blocked beats not_before", () => {
    const task = makeTask({
      blocked: true,
      not_before: "2026-06-20",
      too_late_by: "2026-12-31",
    });
    expect(windowStateDetail(now, task, SA).reason).toBe("blocked");
  });

  it("blocked beats closing", () => {
    const task = makeTask({ blocked: true, too_late_by: "2026-06-12" });
    const detail = windowStateDetail(now, task, SA);
    expect(detail.state).toBe("not-yet");
    expect(detail.reason).toBe("blocked");
  });

  it("not_before beats closing", () => {
    const task = makeTask({
      not_before: "2026-06-20",
      too_late_by: "2026-06-12",
    });
    expect(windowStateDetail(now, task, SA).reason).toBe("not_before");
  });
});

describe("windowState — malformed dates are treated as absent", () => {
  const now = instantInTz("2026-06-01T10:00:00", SA);

  it("ignores a non-calendar too_late_by (never silently closes)", () => {
    expect(windowState(now, makeTask({ too_late_by: "2026-02-30" }), SA)).toBe(
      "open",
    );
    expect(windowState(now, makeTask({ too_late_by: "not-a-date" }), SA)).toBe(
      "open",
    );
    expect(windowState(now, makeTask({ too_late_by: "2026-13-01" }), SA)).toBe(
      "open",
    );
  });

  it("ignores a malformed not_before", () => {
    expect(windowState(now, makeTask({ not_before: "garbage" }), SA)).toBe(
      "open",
    );
  });
});

describe("windowState — determinism across host timezone", () => {
  it("produces the same result regardless of process.env.TZ (uses the param)", () => {
    // The state must depend ONLY on the tz argument. We can't change the process
    // tz mid-test, but we can assert the two tz params disagree on the same UTC
    // instant for a winter cliff — proving the param, not the host clock, decides.
    const task = makeTask({ too_late_by: "2026-01-15" });
    const saEnd = instantInTz("2026-01-15T23:59:59.999", SA);
    const instant = saEnd + 1; // just past SA midnight-end, before DE's
    expect(windowState(instant, task, SA)).toBe("closed");
    expect(windowState(instant, task, DE)).not.toBe("closed");
  });
});
