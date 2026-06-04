import { ImageResponse } from "next/og";
import {
  Mark,
  Wordmark,
  CategoryDots,
  Grid,
  COLORS,
  MONO,
} from "./_brand/brand";
import { loadFonts } from "./_fonts/load";

// X (Twitter) summary card — 1200×628, from the board's "X Summary 1200x628":
// near-black bg + faint 48px grid; a 6px primary accent bar across the top; a
// centered VERTICAL lockup (OUTLINE mark 120 stacked over the OPS·BOARD
// wordmark); the tagline in JetBrains Mono; and the 5 category dots.
export const alt = "OpsBoard — Mission control for one.";
export const size = { width: 1200, height: 628 };
export const contentType = "image/png";

export default async function TwitterImage() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: COLORS.background,
        }}
      >
        <Grid width={1200} height={628} step={48} color="rgba(232,232,240,0.03)" />

        {/* top accent bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 6,
            backgroundColor: COLORS.primary,
          }}
        />

        {/* centered vertical content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 28,
          }}
        >
          <Mark size={120} variant="outline" framePx={3} />
          <Wordmark fontSize={56} letterSpacing={7} />
          <span
            style={{
              fontFamily: MONO,
              fontWeight: 400,
              fontSize: 22,
              letterSpacing: 2,
              color: COLORS.foreground,
            }}
          >
            Mission control for one.
          </span>
          <CategoryDots size={11} gap={12} />
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
