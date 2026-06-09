"use client";

import * as React from "react";
import { Check, KeyRound } from "lucide-react";

import { Badge } from "@opsboard/ui/components/badge";
import { Button } from "@opsboard/ui/components/button";
import { TextInput } from "@opsboard/ui/components/text-input";

import {
  PROVIDER_META,
  clearApiKey,
  saveApiKey,
  validateKeyFormat,
  type AiProvider,
  type ProviderKeyState,
} from "@/components/keys/api-keys";

// A single BYO-key provider row: a labelled secret input + Save, plus a
// configured/last4 badge once stored. Optionally renders a Clear (DELETE)
// affordance (the settings surface wants it; the wizard does not). Composed by
// both the setup wizard's keys step and /settings/keys, so the save/clear
// network logic lives here once. The raw key is held only in local state for
// the moment between typing and PUT — never displayed back, never logged.

export interface ProviderKeyFieldProps {
  provider: AiProvider;
  /** The current stored state for this provider (null = not configured). */
  state: ProviderKeyState | null;
  /** Bubble the new stored state up after a successful save/clear. */
  onChange: (state: ProviderKeyState | null) => void;
  /** Show a Clear (DELETE) button next to Save. Off for the wizard. */
  allowClear?: boolean;
  /** Disable all controls (e.g. while a parent step is busy). */
  disabled?: boolean;
}

export function ProviderKeyField({
  provider,
  state,
  onChange,
  allowClear = false,
  disabled = false,
}: ProviderKeyFieldProps) {
  const meta = PROVIDER_META[provider];
  const [value, setValue] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [confirmingClear, setConfirmingClear] = React.useState(false);

  const isConfigured = state?.configured === true;

  async function handleSave() {
    setError(null);
    const formatError = validateKeyFormat(provider, value);
    if (formatError) {
      setError(formatError);
      return;
    }
    setBusy(true);
    try {
      const next = await saveApiKey(provider, value);
      setValue(""); // never keep the raw key around after a successful store
      onChange(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't save that key.");
    } finally {
      setBusy(false);
    }
  }

  async function handleClear() {
    setError(null);
    setBusy(true);
    try {
      await clearApiKey(provider);
      onChange(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't clear that key.");
    } finally {
      setBusy(false);
      setConfirmingClear(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between gap-2">
        <span className="font-mono text-eyebrow font-semibold uppercase tracking-[1.5px] text-muted-foreground">
          {meta.label}
        </span>
        {isConfigured ? (
          <Badge variant="accent" icon={Check}>
            ····{state.last4}
          </Badge>
        ) : null}
      </div>

      <TextInput
        id={`api-key-${provider}`}
        type="password"
        size="lg"
        leadingIcon={KeyRound}
        placeholder={isConfigured ? "Enter a new key to replace" : meta.placeholder}
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled || busy}
        error={error ?? undefined}
        helper={
          isConfigured
            ? "Stored & encrypted. Type a new key to replace it."
            : `Find it at ${meta.consoleUrl}`
        }
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isConfigured ? "secondary" : "primary"}
          size="sm"
          onClick={() => void handleSave()}
          disabled={disabled || busy || value.trim().length === 0}
        >
          {busy ? "Saving…" : isConfigured ? "Replace key" : "Save key"}
        </Button>
        {allowClear && isConfigured ? (
          confirmingClear ? (
            <>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-[color:var(--color-destructive)]"
                onClick={() => void handleClear()}
                disabled={disabled || busy}
              >
                {busy ? "Clearing…" : "Confirm clear"}
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmingClear(false)}
                disabled={disabled || busy}
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setConfirmingClear(true)}
              disabled={disabled || busy}
            >
              Clear
            </Button>
          )
        ) : null}
      </div>
    </div>
  );
}
