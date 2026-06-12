"use client";

import { z } from "zod";

// A small, REAL client-side error ring buffer for the diagnostics page. Captures
// genuine uncaught errors + unhandled promise rejections (and anything the app
// reports via pushErrorLog) into sessionStorage, capped, newest-first. Not a
// mock: the /debug page reads whatever actually happened this session, and the
// operator can copy it when reporting an issue.

const STORAGE_KEY = "opsboard:errlog";
const MAX_ENTRIES = 50;

const EntrySchema = z.object({
  t: z.number(),
  level: z.enum(["error", "warn", "info"]),
  message: z.string(),
});
export type ClientErrorEntry = z.infer<typeof EntrySchema>;

const LogSchema = z.array(EntrySchema);

function read(): ClientErrorEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = LogSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/** Read the buffer, newest-first. */
export function readErrorLog(): ClientErrorEntry[] {
  return read()
    .slice()
    .sort((a, b) => b.t - a.t);
}

/** Append an entry (capped, oldest dropped). Safe to call anywhere client-side. */
export function pushErrorLog(
  level: ClientErrorEntry["level"],
  message: string,
): void {
  if (typeof window === "undefined") return;
  try {
    const next = read();
    next.push({ t: Date.now(), level, message: message.slice(0, 500) });
    const capped = next.slice(-MAX_ENTRIES);
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(capped));
  } catch {
    /* sessionStorage full / unavailable — diagnostics are best-effort */
  }
}

/** Clear the buffer. */
export function clearErrorLog(): void {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

let installed = false;

/**
 * Install global window listeners that record uncaught errors + unhandled
 * rejections into the buffer. Idempotent (guards a double install) and returns
 * a cleanup. Mounted once near the app root via ErrorLogCollector.
 */
export function installErrorListeners(): () => void {
  if (typeof window === "undefined" || installed) return () => {};
  installed = true;

  const onError = (e: ErrorEvent) => {
    pushErrorLog("error", e.message || "Uncaught error");
  };
  const onRejection = (e: PromiseRejectionEvent) => {
    const reason = e.reason;
    const message =
      reason instanceof Error
        ? reason.message
        : typeof reason === "string"
          ? reason
          : "Unhandled promise rejection";
    pushErrorLog("error", message);
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return () => {
    window.removeEventListener("error", onError);
    window.removeEventListener("unhandledrejection", onRejection);
    installed = false;
  };
}
