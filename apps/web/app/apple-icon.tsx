import { ImageResponse } from "next/og";
import { Mark } from "./_brand/brand";
import { loadFonts } from "./_fonts/load";

// apple-touch icon — 180×180, SOLID variant (orange tile + near-black mark),
// from the board's "apple-touch 180" (fav180: orange tile, `›` fontSize 90,
// cursor 29×83). Square asset; iOS applies its own rounded mask.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const fonts = await loadFonts();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Mark size={180} variant="solid" />
      </div>
    ),
    { ...size, fonts },
  );
}
