import { ManualSurface } from "./manual-surface";

// /manual — the in-app manual. Static content (gated by the proxy); the surface
// is client-only for the scroll-spy TOC + the interactive status demo.
export const metadata = { title: "Manual · OpsBoard" };

export default function ManualPage() {
  return <ManualSurface />;
}
