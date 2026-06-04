import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://ops-manager.ryanjnoble.dev"),
  title: "OpsBoard",
  description:
    "Voice-first, read-only personal mission planner — windows, not deadlines.",
  // Next auto-wires the file-convention assets (icon.svg, apple-icon,
  // opengraph-image, twitter-image, manifest) — we only add the textual fields.
  openGraph: {
    title: "OpsBoard — Mission control for one.",
    description:
      "Voice-first, read-only mission planner. Windows, not deadlines.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-[family-name:var(--font-dm-sans)]">{children}</body>
    </html>
  );
}
