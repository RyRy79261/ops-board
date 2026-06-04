import { ImageResponse } from "next/og";
import { Mark, COLORS } from "./brand";
import { loadFonts } from "../_fonts/load";

// Shared generator for the PWA icon PNGs referenced by manifest.ts. All SOLID
// (orange tile + near-black mark), per the board's "PLATFORM ICONS (solid)".
//
//  - standard (192/512): the mark fills the whole tile (orange to the edges).
//  - maskable (512): the orange bleeds full-canvas but the MARK is shrunk into
//    the inner ~60% so it survives a platform circular/squircle mask
//    (≈20% safe padding all around — the board draws a 224∅ safe-zone in 280).
export async function renderIconPng(
  px: number,
  maskable = false,
): Promise<ImageResponse> {
  const fonts = await loadFonts();
  // For maskable, the orange tile covers the full canvas and we render a SMALLER
  // borderless mark (just the glyph + cursor on the same orange) centered in the
  // safe zone. We reuse <Mark variant="solid"> at a reduced size; since both the
  // background and the mark's own tile are orange, the inner tile is invisible
  // and only the near-black glyph shows — giving the required safe padding.
  const markSize = maskable ? Math.round(px * 0.6) : px;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: maskable ? COLORS.primary : "transparent",
        }}
      >
        <Mark size={markSize} variant="solid" />
      </div>
    ),
    { width: px, height: px, fonts },
  );
}
