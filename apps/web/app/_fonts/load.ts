// Font loader for next/og ImageResponse cards (opengraph-image, twitter-image,
// apple-icon, the PWA icon PNGs). The Brand & Social board specifies the
// wordmark in JetBrains Mono 700 and the OG tagline in DM Sans; satori (which
// powers ImageResponse) needs real font *buffers* — a CSS font stack alone does
// nothing. We bundle the TTFs in this folder (fetched at scaffold time) and read
// them off disk at request/build time, so the build never depends on the network.
//
// ROBUSTNESS: if a font file is ever missing/unreadable, `loadFonts` returns an
// empty array and ImageResponse falls back to its built-in default font. The
// layout + the geometric mark (which is pure SVG/shapes, not glyphs) still
// render, so `next build` can never break over a font.
import { readFile } from "node:fs/promises";
import path from "node:path";

export type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

const FONT_FILES: { file: string; name: string; weight: 400 | 700 }[] = [
  { file: "JetBrainsMono-700.ttf", name: "JetBrains Mono", weight: 700 },
  { file: "JetBrainsMono-400.ttf", name: "JetBrains Mono", weight: 400 },
  { file: "DMSans-400.ttf", name: "DM Sans", weight: 400 },
];

// The TTFs live under apps/web/app/_fonts. Read them via a statically-scoped
// process.cwd() join (next build + the Node serverless runtime both run with
// CWD = the app root) — this is the form Turbopack's NFT tracer accepts without
// flagging an over-broad project trace.
const FONT_DIR = path.join(process.cwd(), "app", "_fonts");

/**
 * Load the bundled TTFs as font buffers for ImageResponse. Any font that fails
 * to load is skipped so the build can never break over a font — ImageResponse
 * falls back to its built-in default and the geometric mark still renders.
 */
export async function loadFonts(): Promise<OgFont[]> {
  const out: OgFont[] = [];
  for (const f of FONT_FILES) {
    try {
      const data = await readFile(path.join(FONT_DIR, f.file));
      out.push({ name: f.name, data, weight: f.weight, style: "normal" });
    } catch {
      // Skip a missing font; ImageResponse falls back to its default.
    }
  }
  return out;
}
