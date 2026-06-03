import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "OpsBoard",
  description:
    "Voice-first, read-only personal mission planner — windows, not deadlines.",
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
