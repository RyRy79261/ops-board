"use client";

import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";

import { cn } from "../lib/utils";

/**
 * Switch — toggle control (atom, canonical `qrgYL`; ADAPT of camp-404's pill
 * switch). Per `02-atoms-form.md`: two track shapes via `shape` —
 *  - **square** (default, the Settings switches): `rounded-[2px]`, 44×24.
 *  - **pill** (Report/Shake switches): `rounded-full`.
 * Track border is `$border-hover` (off) / `$primary` (on); ON fills the track
 * `$primary`; the 18px round thumb is `$foreground` (off) / `$primary-foreground`
 * (on) and translates on checked.
 *
 * Built on `@radix-ui/react-switch` → `role="switch"` + `aria-checked` for free.
 * In a SettingsRow, associate it with the row label via `aria-labelledby`.
 */
export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root> {
  /** Track shape: `square` (Settings) or `pill` (Report/Shake). Default `square`. */
  shape?: "square" | "pill";
}

const Switch = React.forwardRef<
  React.ComponentRef<typeof SwitchPrimitive.Root>,
  SwitchProps
>(({ shape = "square", className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      "peer inline-flex h-6 w-11 shrink-0 items-center border outline-none transition-colors",
      "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
      "disabled:cursor-not-allowed disabled:opacity-50",
      shape === "pill" ? "rounded-full" : "rounded-[2px]",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      "data-[state=unchecked]:border-border-hover data-[state=unchecked]:bg-card-elevated",
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        "pointer-events-none block size-[18px] rounded-full transition-transform",
        "data-[state=checked]:translate-x-6 data-[state=unchecked]:translate-x-0.5",
        "data-[state=checked]:bg-primary-foreground data-[state=unchecked]:bg-foreground",
      )}
    />
  </SwitchPrimitive.Root>
));
Switch.displayName = "Switch";

export { Switch };
