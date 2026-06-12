import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { LegalIndexRow } from "@opsboard/ui/components/legal-index-row";

import { LEGAL_DOC_ENTRIES } from "./content";

// /legal — the legal document index. Static content (gated by the proxy like the
// rest of the app); links to each document at /legal/{slug}.
export const metadata = { title: "Legal · OpsBoard" };

export default function LegalIndexPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/settings">
              <ArrowLeft aria-hidden="true" /> Settings
            </Link>
          </Button>
        }
      />
      <main className="flex flex-1 justify-center p-6">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <Eyebrow as="h1" tone="foreground" weight={700} tracking={2}>
              Legal
            </Eyebrow>
            <p className="text-label text-muted-foreground">
              Privacy and terms. Draft copy — review before any public launch.
            </p>
          </div>

          <div className="flex flex-col divide-y divide-border border border-border">
            {LEGAL_DOC_ENTRIES.map(([slug, doc]) => (
              <Link
                key={slug}
                href={`/legal/${slug}`}
                className="outline-none focus-visible:bg-card-elevated"
              >
                <LegalIndexRow
                  title={doc.title}
                  description={doc.description}
                  updated={`UPD ${doc.updated}`}
                />
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
