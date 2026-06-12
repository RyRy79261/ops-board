import * as React from "react";

import { cn } from "../lib/utils";

/**
 * TypeToConfirmField — destructive-confirmation input (molecule, canonical).
 *
 * A mono caps label, a `$primary`-bordered field, and a state-coloured helper
 * line (`07-asm-debug.md` §TypeToConfirmField). The host keeps the terminal
 * destructive action disabled until `value` matches `confirmWord`. Controlled
 * (value + onValueChange) so it stays a presentational leaf; the match is
 * surfaced via `onMatchChange` for the host to gate its button.
 */
export interface TypeToConfirmFieldProps {
  /** The exact word the user must type. Default `DELETE`. */
  confirmWord?: string;
  /** Controlled value. */
  value: string;
  /** Controlled change handler. */
  onValueChange: (value: string) => void;
  /** Notified whenever the match state flips (host gates its destructive button). */
  onMatchChange?: (matched: boolean) => void;
  /** Override the mono label. Default `TYPE {confirmWord} TO CONFIRM`. */
  label?: string;
  disabled?: boolean;
  id?: string;
}

const TypeToConfirmField = React.forwardRef<
  HTMLInputElement,
  TypeToConfirmFieldProps
>(
  (
    { confirmWord = "DELETE", value, onValueChange, onMatchChange, label, disabled, id },
    ref,
  ) => {
    const matched = value.trim() === confirmWord;
    const inputId = id ?? "type-to-confirm";

    // Tell the host when the match flips (it gates the destructive button on it).
    const lastMatch = React.useRef<boolean | null>(null);
    React.useEffect(() => {
      if (lastMatch.current !== matched) {
        lastMatch.current = matched;
        onMatchChange?.(matched);
      }
    }, [matched, onMatchChange]);

    const helper = !value
      ? `Type ${confirmWord} to confirm.`
      : matched
        ? "Matches — the action is now enabled."
        : `Doesn’t match ${confirmWord} yet.`;

    return (
      <div className="flex flex-col gap-[7px]">
        <label
          htmlFor={inputId}
          className="font-mono text-[11px] uppercase tracking-[1.5px] text-muted-foreground"
        >
          {label ?? `Type ${confirmWord} to confirm`}
        </label>
        <input
          ref={ref}
          id={inputId}
          type="text"
          autoComplete="off"
          autoCapitalize="characters"
          spellCheck={false}
          disabled={disabled}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          aria-describedby={`${inputId}-help`}
          className="h-[42px] border border-primary bg-background px-3 font-mono text-sm tracking-[1px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
        <span
          id={`${inputId}-help`}
          className={cn(
            "font-mono text-eyebrow",
            matched ? "text-success" : "text-muted-foreground-subtle",
          )}
        >
          {helper}
        </span>
      </div>
    );
  },
);
TypeToConfirmField.displayName = "TypeToConfirmField";

export { TypeToConfirmField };
