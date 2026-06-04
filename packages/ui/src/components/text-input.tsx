import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "../lib/utils";

/**
 * TextInput — labelled single-line text entry (Cmp · TextInput).
 *
 * A vertical `[Label?] + Field` stack. The Field is a sharp (`--radius:0`)
 * 1px-bordered box on `$muted` with a JetBrains Mono value, an orange focus
 * ring, and error/disabled states. Optional leading/trailing Lucide icons; the
 * Field flips to `justify-between` when a trailing affordance is present.
 *
 * The labelled wrapper carries the camp-404 `InputField` aria wiring
 * (htmlFor/id via useId, aria-invalid + aria-describedby pointing at whichever
 * of error|helper is actually rendered, error `role="alert"`). `type="password"`
 * auto-adds a real reveal button (aria-label + aria-pressed); an explicit
 * `trailingIcon` / `onTrailingClick` overrides that default affordance.
 *
 * Built framework-agnostic + accessible: the only client concern is the local
 * password-reveal toggle, so the component is RSC-safe without "use client".
 */

/** State → field surface recipe (§ State→style map in the form-atoms spec). */
const fieldVariants = cva(
  // Sharp bordered box on $muted; the value baseline + caret colour come from
  // the inner <input>. Wrapper carries the focus ring so the whole Field lights
  // up (the bare input has its own outline suppressed).
  "flex w-full items-center gap-2 border bg-muted px-3 transition-colors focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background",
  {
    variants: {
      size: {
        // default = 40px showcase cell; lg = 42px on auth/account screens.
        default: "h-10",
        lg: "h-[42px]",
      },
      state: {
        // base/empty + filled share the resting recipe; focus is handled by
        // focus-within above (ring + $background read comes from the ring).
        default: "border-input focus-within:border-primary",
        // error/destructive — stroke flips to $destructive (ring still fires).
        error: "border-destructive focus-within:border-destructive",
        // disabled — dim the whole Field to 0.45, non-interactive.
        disabled: "border-input opacity-45",
      },
    },
    defaultVariants: { size: "default", state: "default" },
  },
);

export interface TextInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  /** Optional eyebrow label above the field. Omit when a parent Row supplies it. */
  label?: React.ReactNode;
  /** Field height: default = 40px (showcase); lg = 42px (auth/account screens). */
  size?: VariantProps<typeof fieldVariants>["size"];
  /** Error message — flips stroke to $destructive + renders helper as role="alert". */
  error?: string;
  /** Helper text below the field ($muted-foreground). Suppressed while `error` is set. */
  helper?: string;
  /** Optional leading 16×16 Lucide icon ($muted-foreground-subtle). */
  leadingIcon?: LucideIcon;
  /** Optional trailing 16×16 Lucide icon ($muted-foreground); forces space-between. */
  trailingIcon?: LucideIcon;
  /** Click handler for the trailing affordance (also makes it a real button). */
  onTrailingClick?: () => void;
  /** Accessible name for the trailing button (required when interactive). */
  trailingLabel?: string;
  /** Class applied to the field wrapper (the <input> keeps its own className). */
  wrapperClassName?: string;
}

const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  (
    {
      label,
      size,
      error,
      helper,
      leadingIcon: LeadingIcon,
      trailingIcon,
      onTrailingClick,
      trailingLabel,
      wrapperClassName,
      className,
      id,
      type = "text",
      required,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const fieldId = id ?? generatedId;
    const helperId = `${fieldId}-helper`;
    const errorId = `${fieldId}-error`;
    // Only describe with the element that is actually rendered (error wins).
    const describedBy = error ? errorId : helper ? helperId : undefined;

    // type="password" gets a built-in reveal toggle unless the consumer wired
    // their own trailing affordance.
    const isPassword = type === "password";
    const [revealed, setRevealed] = React.useState(false);
    const showPasswordToggle = isPassword && !trailingIcon && !onTrailingClick;
    const resolvedType = isPassword && revealed ? "text" : type;

    // The trailing slot is the password toggle, or a consumer-supplied icon.
    const TrailingIcon = trailingIcon ?? (showPasswordToggle ? (revealed ? EyeOff : Eye) : undefined);
    const hasTrailing = Boolean(TrailingIcon);

    const state: NonNullable<VariantProps<typeof fieldVariants>["state"]> =
      disabled ? "disabled" : error ? "error" : "default";

    return (
      <div className="flex w-full flex-col gap-[7px]">
        {label != null && (
          <label
            htmlFor={fieldId}
            className="font-mono text-eyebrow uppercase leading-none tracking-[1.5px] text-muted-foreground"
          >
            {label}
            {required && <span className="ml-1 text-primary">*</span>}
          </label>
        )}

        <div
          className={cn(
            fieldVariants({ size, state }),
            hasTrailing && "justify-between",
            wrapperClassName,
          )}
        >
          {LeadingIcon && (
            <LeadingIcon
              className="size-4 shrink-0 text-muted-foreground-subtle"
              aria-hidden="true"
            />
          )}

          <input
            ref={ref}
            id={fieldId}
            type={resolvedType}
            required={required}
            disabled={disabled}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={cn(
              // JetBrains Mono 14; placeholder $muted-foreground-subtle, typed
              // $foreground. Transparent bg so the Field surface shows through;
              // outline suppressed (the wrapper carries the ring).
              "min-w-0 flex-1 bg-transparent font-mono text-[14px] text-foreground caret-primary outline-none",
              "placeholder:text-muted-foreground-subtle",
              "disabled:cursor-not-allowed",
              className,
            )}
            {...props}
          />

          {TrailingIcon &&
            (showPasswordToggle || onTrailingClick ? (
              <button
                type="button"
                // Toggle does not submit; reveal exposes the typed value.
                onClick={
                  onTrailingClick ?? (() => setRevealed((v) => !v))
                }
                disabled={disabled}
                aria-label={
                  trailingLabel ??
                  (showPasswordToggle
                    ? revealed
                      ? "Hide password"
                      : "Show password"
                    : undefined)
                }
                aria-pressed={showPasswordToggle ? revealed : undefined}
                className="-mr-1 inline-flex size-6 shrink-0 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed"
              >
                <TrailingIcon className="size-4" aria-hidden="true" />
              </button>
            ) : (
              <TrailingIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden="true"
              />
            ))}
        </div>

        {helper && !error && (
          <p id={helperId} className="text-caption text-muted-foreground">
            {helper}
          </p>
        )}
        {error && (
          <p id={errorId} className="text-caption text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  },
);
TextInput.displayName = "TextInput";

export { TextInput, fieldVariants };
