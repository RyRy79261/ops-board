import type { ReactNode } from "react";
import { Card, CardContent } from "@opsboard/ui/components/card";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";

/**
 * Centred auth surface — the chrome every credential screen sits inside.
 * Re-skinned for OpsBoard (tactical near-black background, sharp radius-0
 * card, mono eyebrow). Mirrors the role camp-404's AuthShell plays, minus the
 * Back button (the sign-in/up flow is two flat sibling routes, no stack).
 */
export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-sm flex-col gap-4">
        <div className="flex flex-col items-center gap-1.5 text-center">
          {/* OPS/BOARD wordmark — mono caps, tactical orange on the slash. */}
          <Eyebrow
            as="span"
            tone="foreground"
            weight={700}
            tracking={3}
            className="text-[18px] leading-none"
          >
            OPS<span className="text-primary">/</span>BOARD
          </Eyebrow>
          <p className="text-label text-muted-foreground">
            Windows, not deadlines.
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
