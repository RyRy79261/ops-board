"use client";

import * as React from "react";
import { X } from "lucide-react";

import { cn } from "../lib/utils";
import { Button } from "./button";

/**
 * OpsBoard Toast — ADAPTED from camp-404 toast.tsx, re-skinned via OpsBoard
 * tokens (sharp radius-0 card + variant accent bar, mono caps header, DM Sans
 * body). Provider-less: a module-level store surfaced imperatively via `toast()`
 * and rendered by a single mounted <Toaster/> (useSyncExternalStore, SSR-safe —
 * getServerSnapshot returns a stable EMPTY).
 *
 * The transient result/confirmation surface for voice & MCP commands (canonical
 * kTqS3). The camp ToastRecord is EXTENDED with `actions[]` (Confirm/Cancel) for
 * the needs-confirmation flow and `picks[]` for the lightweight disambiguation
 * cousin — both overload the Meta slot per the contract.
 *
 * Variant → accent / header colour / role / dwell:
 *   success           $success      role=status  ~4–5s auto-dismiss
 *   needsConfirmation $warning      —            persistent (Actions row)
 *   disambiguation    $border-hover —            persistent (Picks list, neutral)
 *   info / query      $info(orange) role=status  ~8s, no buttons
 *   error             $destructive  role=alert   tap-to-dismiss
 */

export type ToastVariant =
  | "success"
  | "needsConfirmation"
  | "disambiguation"
  | "info"
  | "error";

export interface ToastAction {
  label: string;
  /** confirm → re-issue intent (confirmed); cancel → dismiss no-op. */
  intent: "confirm" | "cancel";
  /** Button skin; defaults: confirm=destructive (CONFIRM DELETE), cancel=outline. */
  variant?: "primary" | "destructive" | "outline" | "ghost" | "secondary";
}

export interface ToastPick {
  /** Primary label, e.g. 'Cardiology follow-up'. */
  name: string;
  /** Trailing mono code, e.g. window/category, e.g. 'MED' / 'TECH'. */
  code: string;
}

export interface ToastOptions {
  /** DM Sans body. */
  body?: React.ReactNode;
  /** Mono caption footer ('AUTO-DISMISS · 4S' / 'TAP TO DISMISS'). */
  meta?: string;
  /** needsConfirmation: [CONFIRM (destructive), CANCEL (outline)]. */
  actions?: ToastAction[];
  /** disambiguation: 2–3 tap rows {name + code}. */
  picks?: ToastPick[];
  /** ms before auto-dismiss; `null`/`Infinity` to persist until dismissed. */
  durationMs?: number | null;
}

export interface ToastRecord {
  id: number;
  variant: ToastVariant;
  /** Mono caps header, e.g. '✓ MARKED DONE'. */
  header: string;
  body?: React.ReactNode;
  meta?: string;
  actions?: ToastAction[];
  picks?: ToastPick[];
  duration: number;
  /** confirm → re-issue intent (confirmed:true), then replace with success. */
  onConfirm?: () => void;
  /** Escape / CANCEL. */
  onCancel?: () => void;
  /** disambiguation: a pick was chosen → re-issue resolved intent. */
  onPick?: (pick: ToastPick, index: number) => void;
}

// Module store. CLIENT-ONLY: toast()/dismiss are imperative client APIs and the
// <Toaster/> is "use client"; the server never reads this mutable state
// (getServerSnapshot returns a stable EMPTY), so there's no cross-request bleed
// under SSR. Reassigned (not mutated) so useSyncExternalStore's referential
// equality holds between unrelated renders.
let toasts: ToastRecord[] = [];
const EMPTY: ToastRecord[] = [];
const listeners = new Set<() => void>();
let nextId = 1;

function emit() {
  for (const listener of listeners) listener();
}
function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
function getSnapshot() {
  return toasts;
}
function getServerSnapshot() {
  return EMPTY;
}

/** The current toast stack — a defensive copy so callers can't mutate the store
 *  out-of-band (mutations must go through toast()/dismiss() to notify subscribers). */
export function getToasts(): readonly ToastRecord[] {
  return toasts.slice();
}

/** Dismiss one toast by id, or all of them when called with no id. */
function dismiss(id?: number) {
  toasts = id === undefined ? [] : toasts.filter((t) => t.id !== id);
  emit();
}

// Per-variant dwell defaults: success ~5s, info/query ~8s, error tap-only,
// needs-confirmation + disambiguation persist (Infinity).
const DURATION_BY_VARIANT: Record<ToastVariant, number> = {
  success: 5000,
  info: 8000,
  error: Infinity,
  needsConfirmation: Infinity,
  disambiguation: Infinity,
};

// Accept a non-negative finite ms or Infinity (persist); null/undefined fall back
// to the variant default; anything else (negative, NaN) also falls back so a bad
// value can't make setTimeout fire at ~0.
function normalizeDuration(
  d: number | null | undefined,
  variant: ToastVariant,
): number {
  const fallback = DURATION_BY_VARIANT[variant];
  if (d === undefined || d === null) return fallback;
  if (d === Infinity) return Infinity;
  return Number.isFinite(d) && d >= 0 ? d : fallback;
}

function push(variant: ToastVariant, header: string, opts?: ToastOptions): number {
  const id = nextId++;
  toasts = [
    ...toasts,
    {
      id,
      variant,
      header,
      body: opts?.body,
      meta: opts?.meta,
      actions: opts?.actions,
      picks: opts?.picks,
      duration: normalizeDuration(opts?.durationMs, variant),
    },
  ];
  emit();
  return id;
}

type ToastFn = ((header: string, opts?: ToastOptions) => number) & {
  success: (header: string, opts?: ToastOptions) => number;
  error: (header: string, opts?: ToastOptions) => number;
  info: (header: string, opts?: ToastOptions) => number;
  /** Persistent confirmation toast — pass actions OR onConfirm/onCancel. */
  needsConfirmation: (
    header: string,
    opts?: ToastOptions & { onConfirm?: () => void; onCancel?: () => void },
  ) => number;
  /** Persistent lightweight picker — pass picks + onPick. */
  disambiguation: (
    header: string,
    opts?: ToastOptions & {
      onPick?: (pick: ToastPick, index: number) => void;
    },
  ) => number;
  /** Dismiss one toast by id, or all of them when called with no id. */
  dismiss: (id?: number) => void;
}

export const toast: ToastFn = Object.assign(
  (header: string, opts?: ToastOptions) => push("info", header, opts),
  {
    success: (header: string, opts?: ToastOptions) =>
      push("success", header, opts),
    error: (header: string, opts?: ToastOptions) => push("error", header, opts),
    info: (header: string, opts?: ToastOptions) => push("info", header, opts),
    needsConfirmation: (
      header: string,
      opts?: ToastOptions & { onConfirm?: () => void; onCancel?: () => void },
    ) => {
      const id = push("needsConfirmation", header, opts);
      const i = toasts.findIndex((t) => t.id === id);
      if (i !== -1) {
        toasts = toasts.map((t) =>
          t.id === id
            ? { ...t, onConfirm: opts?.onConfirm, onCancel: opts?.onCancel }
            : t,
        );
        emit();
      }
      return id;
    },
    disambiguation: (
      header: string,
      opts?: ToastOptions & {
        onPick?: (pick: ToastPick, index: number) => void;
      },
    ) => {
      const id = push("disambiguation", header, opts);
      const i = toasts.findIndex((t) => t.id === id);
      if (i !== -1) {
        toasts = toasts.map((t) =>
          t.id === id ? { ...t, onPick: opts?.onPick } : t,
        );
        emit();
      }
      return id;
    },
    dismiss,
  },
);

// Variant → accent-bar + header text colour. disambiguation is NEUTRAL
// ($border-hover), NOT a brand colour (per reconciliation). info aliases orange.
const ACCENT: Record<ToastVariant, string> = {
  success: "bg-success",
  needsConfirmation: "bg-warning",
  disambiguation: "bg-border-hover",
  info: "bg-primary",
  error: "bg-destructive",
};

const HEADER_COLOR: Record<ToastVariant, string> = {
  success: "text-success",
  needsConfirmation: "text-warning",
  disambiguation: "text-foreground",
  info: "text-primary",
  error: "text-destructive",
};

// Default Button skin per action intent (overridable via action.variant).
const ACTION_VARIANT: Record<ToastAction["intent"], ToastAction["variant"]> = {
  confirm: "destructive",
  cancel: "outline",
};

export interface ToastItemProps {
  toast: ToastRecord;
}

export function ToastItem({ toast: t }: ToastItemProps) {
  const [paused, setPaused] = React.useState(false);
  const confirmRef = React.useRef<HTMLButtonElement>(null);

  // Auto-dismiss timer (paused on hover). Persistent toasts (Infinity) skip it.
  React.useEffect(() => {
    if (paused || !Number.isFinite(t.duration)) return;
    const timer = setTimeout(() => dismiss(t.id), t.duration);
    return () => clearTimeout(timer);
  }, [t.id, t.duration, paused]);

  // Persistent confirmation toast → move focus to the Confirm action.
  React.useEffect(() => {
    if (t.variant === "needsConfirmation") confirmRef.current?.focus();
  }, [t.variant]);

  function handleConfirm() {
    t.onConfirm?.();
    dismiss(t.id);
  }
  function handleCancel() {
    t.onCancel?.();
    dismiss(t.id);
  }
  function handlePick(pick: ToastPick, index: number) {
    t.onPick?.(pick, index);
    dismiss(t.id);
  }
  function handleAction(action: ToastAction) {
    if (action.intent === "confirm") handleConfirm();
    else handleCancel();
  }

  return (
    // Each toast carries its own live semantics — role="alert" (implicitly
    // assertive) for errors so failures interrupt; role="status" (implicitly
    // polite) for success/info. needsConfirmation/disambiguation are persistent
    // interactive surfaces (no live role). This is why the Toaster container is
    // NOT a live region (nesting role="alert" in aria-live="polite" conflicts).
    <div
      role={
        t.variant === "error"
          ? "alert"
          : t.variant === "success" || t.variant === "info"
            ? "status"
            : undefined
      }
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onKeyDown={(e) => {
        // Escape = Cancel on the persistent confirmation toast.
        if (e.key === "Escape" && t.variant === "needsConfirmation") {
          e.stopPropagation();
          handleCancel();
        }
      }}
      className="pointer-events-auto flex w-full max-w-sm flex-col border border-border bg-card shadow-e2"
    >
      {/* Accent — 2px bar, colour by variant. Decorative. */}
      <span aria-hidden="true" className={cn("h-0.5 w-full shrink-0", ACCENT[t.variant])} />

      <div className="flex flex-col gap-2.5 p-4">
        <div className="flex items-start justify-between gap-3">
          <p
            className={cn(
              "font-mono text-caption font-semibold uppercase tracking-[0.05em] leading-none",
              HEADER_COLOR[t.variant],
            )}
          >
            {t.header}
          </p>
          {/* Dismiss ✕ — present on all variants except the persistent
              confirmation (which resolves via CONFIRM/CANCEL). */}
          {t.variant !== "needsConfirmation" ? (
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label={`Dismiss: ${t.header}`}
              className="-mr-1 -mt-0.5 shrink-0 p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <X aria-hidden="true" className="size-3.5" />
            </button>
          ) : null}
        </div>

        {t.body ? (
          <p
            className={cn(
              "text-body leading-snug",
              t.variant === "error" ? "text-muted-foreground" : "text-foreground",
            )}
          >
            {t.body}
          </p>
        ) : null}

        {/* Overloaded Meta slot: Actions row (needsConfirmation) → Picks list
            (disambiguation) → mono caption (success/info/error). */}
        {t.actions && t.actions.length > 0 ? (
          <div className="flex items-center gap-2.5">
            {t.actions.map((action, i) => (
              <Button
                key={`${action.intent}-${i}`}
                ref={action.intent === "confirm" ? confirmRef : undefined}
                size="sm"
                variant={action.variant ?? ACTION_VARIANT[action.intent]}
                onClick={() => handleAction(action)}
                className="text-micro tracking-[1px]"
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : t.picks && t.picks.length > 0 ? (
          <ul className="flex flex-col gap-1.5">
            {t.picks.map((pick, i) => (
              <li key={`${pick.code}-${i}`}>
                <button
                  type="button"
                  onClick={() => handlePick(pick, i)}
                  className="flex w-full items-center justify-between gap-3 border border-border bg-card-elevated px-3 py-2.5 text-left transition-colors hover:border-border-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span className="min-w-0 truncate text-body text-foreground">
                    {pick.name}
                  </span>
                  <span className="shrink-0 font-mono text-mono-caption uppercase tracking-[1px] text-muted-foreground">
                    {pick.code}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : t.meta ? (
          <p className="font-mono text-micro-xs uppercase tracking-[1px] text-muted-foreground-subtle">
            {t.meta}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface ToasterProps {
  className?: string;
}

/** Mount once near the app root. Renders the live toast stack. */
export function Toaster({ className }: ToasterProps) {
  const items = React.useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return (
    // A labelled region, NOT a live region — each toast announces via its own
    // role (status/alert) so error urgency isn't flattened to polite. Bottom-
    // center on mobile, bottom-right on desktop (sits above the voice FAB).
    <div
      role="region"
      aria-label="Notifications"
      className={cn(
        "pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 p-4 sm:items-end",
        className,
      )}
    >
      {items.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}
