/**
 * @opsboard/ui — redundant-channel audit (S8; design-brief §6 LOCKED #6:
 * "Color is never the sole carrier — every category/state is icon + label +
 * color"; docs/tech-spec/01-foundations.md §103/§293).
 *
 * These tests assert the rule STRUCTURALLY: the state/category carriers
 * (WindowStatePill, CategoryTag, StatusBadge) each render a real TEXT label —
 * and an icon glyph where the spec calls for one — so meaning is carried by
 * icon + label, never by color alone. We query the rendered output for the
 * label text (and for the decorative aria-hidden icon).
 */
import * as React from "react";
import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";

import {
  WindowStatePill,
  type WindowState,
} from "../components/window-state-pill";
import { CategoryTag } from "../components/category-tag";
import { StatusBadge } from "../components/status-badge";

/** The single SVG (Lucide) glyph any of these carriers should render. */
function getDecorativeIcon(container: HTMLElement): SVGElement | null {
  // Lucide renders an <svg> marked aria-hidden by the component.
  return container.querySelector("svg");
}

describe("redundant-channel — WindowStatePill carries icon + text per state", () => {
  // [state, expected uppercase label fragment]. `open` is silent unless asked.
  const CASES: ReadonlyArray<[WindowState, string]> = [
    ["open", "OPEN"],
    ["closing", "CLOSING"],
    ["closed", "WINDOW CLOSED"],
    ["not-yet", "NOT YET"],
    ["blocked", "BLOCKED"],
  ];

  it.each(CASES)("'%s' renders the '%s' text label (not color-only)", (state, label) => {
    const { container } = render(
      // showOpen forces the otherwise-silent open pill to render its label.
      <WindowStatePill state={state} showOpen variant="tinted" />,
    );
    expect(container.textContent).toContain(label);
  });

  it.each(CASES)("'%s' renders a decorative (aria-hidden) state icon", (state) => {
    const { container } = render(<WindowStatePill state={state} showOpen />);
    const icon = getDecorativeIcon(container);
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("closing pill appends the T-{n}d countdown text", () => {
    const { container } = render(<WindowStatePill state="closing" daysUntil={3} />);
    expect(container.textContent).toContain("CLOSING");
    expect(container.textContent).toContain("T-3d");
  });

  it("closed pill keeps the textual label alongside its trailing date", () => {
    const { container } = render(<WindowStatePill state="closed" date="3 Jun" />);
    expect(container.textContent).toContain("WINDOW CLOSED");
    expect(container.textContent).toContain("3 Jun");
  });
});

describe("redundant-channel — CategoryTag carries icon + uppercase label per tone", () => {
  // [category slug, expected uppercase label]. The 5 seeded categories (§4).
  const CASES = [
    ["medical", "MEDICAL"],
    ["bureaucratic", "BUREAUCRATIC"],
    ["travel", "TRAVEL"],
    ["gear", "GEAR"],
    ["tech", "TECH"],
  ] as const;

  it.each(CASES)("'%s' renders the '%s' label text", (category, label) => {
    const { container } = render(<CategoryTag category={category} />);
    expect(container.textContent).toContain(label);
  });

  it.each(CASES)("'%s' renders a decorative (aria-hidden) category icon", (category) => {
    const { container } = render(<CategoryTag category={category} />);
    const icon = getDecorativeIcon(container);
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("dimmed tag still carries its label text (state not color-only)", () => {
    const { container } = render(<CategoryTag category="travel" dimmed />);
    expect(container.textContent).toContain("TRAVEL");
  });
});

describe("redundant-channel — StatusBadge carries icon + uppercase label per status", () => {
  // [stored status, expected uppercase word]. 'blocked' is intentionally absent.
  const CASES = [
    ["not-started", "NOT STARTED"],
    ["in-progress", "IN PROGRESS"],
    ["done", "DONE"],
  ] as const;

  it.each(CASES)("'%s' renders the '%s' label text", (status, label) => {
    const { container } = render(<StatusBadge status={status} />);
    expect(container.textContent).toContain(label);
  });

  it.each(CASES)("'%s' renders a decorative (aria-hidden) status icon", (status) => {
    const { container } = render(<StatusBadge status={status} />);
    const icon = getDecorativeIcon(container);
    expect(icon).not.toBeNull();
    expect(icon?.getAttribute("aria-hidden")).toBe("true");
  });

  it("each status pairs an icon WITH text (icon never replaces the word)", () => {
    const { container } = render(
      <div>
        <StatusBadge status="not-started" />
        <StatusBadge status="in-progress" />
        <StatusBadge status="done" />
      </div>,
    );
    // All three uppercase words are present as text.
    expect(container.textContent).toContain("NOT STARTED");
    expect(container.textContent).toContain("IN PROGRESS");
    expect(container.textContent).toContain("DONE");
    // And there is one decorative icon per badge (3 total).
    expect(container.querySelectorAll("svg[aria-hidden]")).toHaveLength(3);
  });
});
