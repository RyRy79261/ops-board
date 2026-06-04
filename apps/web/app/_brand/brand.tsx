// Shared brand tokens + mark/lockup pieces for the next/og ImageResponse cards
// (opengraph-image, twitter-image, apple-icon, the PWA icon PNGs).
//
// Faithful to the Pencil "Brand & Social" board (slide 12). The mark is the
// V4 "command-cursor" lockup: a terminal-prompt chevron `›` (JetBrains Mono 700)
// immediately followed by a CURSOR block — a filled vertical bar. Zero radius
// everywhere; this is a tactical terminal aesthetic.
//
// NOTE: these are plain objects/JSX consumed by satori, not DOM. satori supports
// a flexbox subset, so every multi-child container sets display:"flex".
import type { CSSProperties, ReactElement } from "react";

export const COLORS = {
  primary: "#ff6b35",
  background: "#0a0a0c",
  foreground: "#e8e8f0",
  mutedForeground: "#7a7a8e",
  muted: "#131318",
  border: "#26262e",
  catMedical: "#e05a9f",
  catBureaucratic: "#5aa0e0",
  catTravel: "#5ae0a0",
  catGear: "#e0c05a",
  catTech: "#a05ae0",
} as const;

export const CATEGORY_DOTS = [
  COLORS.catMedical,
  COLORS.catBureaucratic,
  COLORS.catTravel,
  COLORS.catGear,
  COLORS.catTech,
];

export const MONO = "JetBrains Mono";
export const SANS = "DM Sans";

/**
 * The command-cursor MARK inside its tile. Proportions are lifted directly from
 * the board: at a 180px tile the chevron is fontSize 90 (≈ tileSize/2), the
 * cursor block is 29×83 (≈ 0.16×0.46 of the tile), with a small gap. We scale
 * those ratios to whatever `size` is requested.
 *
 * variant:
 *  - "solid":   ORANGE tile + NEAR-BLACK mark, no frame (favicons / app icons).
 *  - "outline": NEAR-BLACK tile + thin inner ORANGE frame + ORANGE mark (lockups).
 */
export function Mark({
  size,
  variant,
  framePx,
}: {
  size: number;
  variant: "solid" | "outline";
  /** Override the outline frame thickness; defaults to a board-faithful ratio. */
  framePx?: number;
}): ReactElement {
  const solid = variant === "solid";
  const tileFill = solid ? COLORS.primary : COLORS.background;
  const markFill = solid ? COLORS.background : COLORS.primary;

  // Board ratios (from the 180px master): chevron 90/180, cursor 29×83 /180,
  // gap 7/180, outline frame 5/180.
  const chevronSize = Math.round(size * 0.5);
  const cursorW = Math.max(2, Math.round(size * 0.161));
  const cursorH = Math.round(size * 0.461);
  const gap = Math.max(1, Math.round(size * 0.039));
  const frame = framePx ?? Math.max(1, Math.round(size * 0.028));

  const tileStyle: CSSProperties = {
    width: size,
    height: size,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap,
    backgroundColor: tileFill,
    // sharp — zero radius, tactical
    borderRadius: 0,
  };
  if (!solid) {
    tileStyle.border = `${frame}px solid ${COLORS.primary}`;
  }

  return (
    <div style={tileStyle}>
      <div
        style={{
          display: "flex",
          fontFamily: MONO,
          fontWeight: 700,
          fontSize: chevronSize,
          lineHeight: 1,
          color: markFill,
          // nudge the chevron's optical baseline to sit centered with the bar
          marginTop: -Math.round(size * 0.04),
        }}
      >
        ›
      </div>
      <div
        style={{
          width: cursorW,
          height: cursorH,
          backgroundColor: markFill,
          borderRadius: 0,
        }}
      />
    </div>
  );
}

/**
 * The wordmark: "OPS" (orange) + "BOARD" (muted), JetBrains Mono 700, uppercase,
 * tracked. `fontSize` and `letterSpacing` are passed by each card to match its
 * board frame (OG uses 54/6, X uses 56/7).
 */
export function Wordmark({
  fontSize,
  letterSpacing,
}: {
  fontSize: number;
  letterSpacing: number;
}): ReactElement {
  const base: CSSProperties = {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize,
    letterSpacing,
    lineHeight: 1,
    textTransform: "uppercase",
  };
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <span style={{ ...base, color: COLORS.primary }}>OPS</span>
      <span style={{ ...base, color: COLORS.mutedForeground }}>BOARD</span>
    </div>
  );
}

/** Row of the 5 category dots (the board draws them as sharp squares). */
export function CategoryDots({
  size,
  gap,
}: {
  size: number;
  gap: number;
}): ReactElement {
  return (
    <div style={{ display: "flex", alignItems: "center", gap }}>
      {CATEGORY_DOTS.map((c) => (
        <div
          key={c}
          style={{
            width: size,
            height: size,
            backgroundColor: c,
            borderRadius: 0,
          }}
        />
      ))}
    </div>
  );
}

/** Faint terminal grid overlay used behind the OG card (board "Grid", 90px). */
export function Grid({
  width,
  height,
  step,
  color,
}: {
  width: number;
  height: number;
  step: number;
  color: string;
}): ReactElement {
  const lines: ReactElement[] = [];
  for (let x = step; x < width; x += step) {
    lines.push(
      <div
        key={`v${x}`}
        style={{
          position: "absolute",
          left: x,
          top: 0,
          width: 1,
          height,
          backgroundColor: color,
        }}
      />,
    );
  }
  for (let y = step; y < height; y += step) {
    lines.push(
      <div
        key={`h${y}`}
        style={{
          position: "absolute",
          left: 0,
          top: y,
          width,
          height: 1,
          backgroundColor: color,
        }}
      />,
    );
  }
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        width,
        height,
      }}
    >
      {lines}
    </div>
  );
}
