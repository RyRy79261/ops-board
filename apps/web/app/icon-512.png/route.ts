import { renderIconPng } from "../_brand/icon-png";

// 512×512 standard PWA icon (SOLID). Referenced by manifest.ts.
export const contentType = "image/png";

export function GET() {
  return renderIconPng(512);
}
