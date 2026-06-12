"use client";

import { useEffect } from "react";
import { installErrorListeners } from "@/lib/client-error-log";

// Mounted once near the app root (layout). Installs the global error/rejection
// listeners that feed the diagnostics buffer. Renders nothing.
export function ErrorLogCollector() {
  useEffect(() => installErrorListeners(), []);
  return null;
}
