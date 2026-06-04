import { ImageResponse } from "next/og";
import {
  Mark,
  Wordmark,
  CategoryDots,
  Grid,
  COLORS,
  MONO,
  SANS,
} from "./_brand/brand";
import { loadFonts } from "./_fonts/load";

// Open Graph card — 1200×630, from the board's "OG 1200x630":
// near-black bg + faint 90px terminal grid; a top bar with the "TACTICAL
// TERMINAL" eyebrow (left) and a "WINDOW CLOSES IN 2D" window-state pill
// (right); centered OUTLINE mark + OPS·BOARD wordmark; the tagline; and a row
// of the 5 category dots. Sharp / zero radius throughout.
export const alt = "OpsBoard — Mission control for one.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Grid width={1200} height={630} step={90} color="#16161d" />

        {/* TopBar: eyebrow (left) + window-state pill (right) */}
        <div
          style={{
            position: "absolute",
            top: 40,
            left: 48,
            width: 1104,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 14,
              letterSpacing: 3,
              color: COLORS.mutedForeground,
              textTransform: "uppercase",
            }}
          >
            TACTICAL TERMINAL
          </span>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 9,
              padding: "8px 14px",
              backgroundColor: COLORS.muted,
              border: `1px solid ${COLORS.border}`,
              borderRadius: 0,
            }}
          >
            <div
              style={{ width: 8, height: 8, backgroundColor: COLORS.primary }}
            />
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: 1.5,
                color: COLORS.foreground,
              }}
            >
              WINDOW CLOSES IN 2D
            </span>
          </div>
        </div>

        {/* Centered content: lockup + tagline + dots */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 32,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
            <Mark size={108} variant="outline" framePx={3} />
            <Wordmark fontSize={54} letterSpacing={6} />
          </div>
          <span
            style={{
              fontFamily: SANS,
              fontWeight: 400,
              fontSize: 26,
              color: COLORS.foreground,
            }}
          >
            Mission control for one.
          </span>
          <CategoryDots size={13} gap={15} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
