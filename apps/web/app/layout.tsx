import "./globals.css";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { ErrorLogCollector } from "@/components/error-log-collector";

// Self-hosted brand faces from the bundled TTFs in ./_fonts. next/font generates
// the @font-face + preload + a CSS variable per family; globals.css consumes those
// vars as the PRIMARY family with the old name/stack as fallback. Without this the
// brand faces never actually loaded — the CSS vars named "DM Sans" / "JetBrains
// Mono" but nothing registered those faces, so the UI silently fell back to
// ui-sans-serif / ui-monospace. The *-loaded variable names are distinct from the
// globals tokens so there's no :root-vs-html precedence fight (and Storybook,
// which has no next/font, still resolves via the fallback stack). DM Sans ships
// the 400 master only; heavier weights synthesise.
const dmSans = localFont({
  src: [{ path: "./_fonts/DMSans-400.ttf", weight: "400", style: "normal" }],
  variable: "--font-dm-sans-loaded",
  display: "swap",
});
const jetbrainsMono = localFont({
  src: [
    { path: "./_fonts/JetBrainsMono-400.ttf", weight: "400", style: "normal" },
    { path: "./_fonts/JetBrainsMono-700.ttf", weight: "700", style: "normal" },
  ],
  variable: "--font-jetbrains-mono-loaded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://ops-board.ryanjnoble.dev"),
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
    <html lang="en" className={`${dmSans.variable} ${jetbrainsMono.variable}`}>
      <body className="font-[family-name:var(--font-dm-sans)]">
        {/* Records uncaught errors/rejections into the diagnostics buffer. */}
        <ErrorLogCollector />
        {children}
      </body>
    </html>
  );
}
