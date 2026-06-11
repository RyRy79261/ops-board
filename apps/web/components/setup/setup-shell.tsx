import type { ReactNode } from "react";
import { Card, CardContent } from "@opsboard/ui/components/card";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";

/**
 * Centred onboarding surface — the chrome the setup wizard sits inside. Mirrors
 * AuthShell (apps/web/components/auth/auth-shell.tsx): tactical near-black
 * background, the OPS/BOARD wordmark, a sharp radius-0 card. Slightly wider than
 * the auth card (max-w-md) to give the multi-step wizard room. A Pencil design
 * will reskin this later, so the step content is kept out of here.
 */
export function SetupShell({
  subtitle,
  children,
}: {
  subtitle?: ReactNode;
  children: ReactNode;
}) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-background p-6">
      <div className="flex w-full max-w-md flex-col gap-4">
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
            {subtitle ?? "Let's get your keys set up."}
          </p>
        </div>
        <Card className="overflow-hidden p-0">
          <CardContent className="p-6 md:p-8">{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
