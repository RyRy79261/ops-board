import { renderIconPng } from "../_brand/icon-png";

// 512×512 MASKABLE PWA icon (SOLID, ~20% safe padding). Referenced by
// manifest.ts with purpose:"maskable".
export const contentType = "image/png";

export function GET() {
  return renderIconPng(512, true);
}
