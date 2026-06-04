import { renderIconPng } from "../_brand/icon-png";

// 192×192 standard PWA icon (SOLID). Referenced by manifest.ts.
export const contentType = "image/png";

export function GET() {
  return renderIconPng(192);
}
