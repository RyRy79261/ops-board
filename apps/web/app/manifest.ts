import type { MetadataRoute } from "next";

// PWA manifest, served at /manifest.webmanifest by convention. Brand values from
// the "Brand & Social" board: orange theme, near-black background, the tagline
// "Mission control for one." as the description. Icons point at the SOLID PNG
// routes (192, 512, and a 512 maskable with safe padding).
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "OpsBoard",
    short_name: "OpsBoard",
    description: "Mission control for one.",
    theme_color: "#ff6b35",
    background_color: "#0a0a0c",
    display: "standalone",
    start_url: "/",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
