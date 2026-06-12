import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { AppHeader } from "@opsboard/ui/components/app-header";
import { Button } from "@opsboard/ui/components/button";
import { Eyebrow } from "@opsboard/ui/components/eyebrow";
import { LegalSection } from "@opsboard/ui/components/legal-section";
import { CodeCallout } from "@opsboard/ui/components/code-callout";

import { LEGAL_DOCS, type LegalDocSlug } from "../content";

// /legal/{privacy|terms} — renders one legal document from the content module.
// Pre-rendered for both known docs; an unknown slug 404s.

export function generateStaticParams() {
  return (Object.keys(LEGAL_DOCS) as LegalDocSlug[]).map((doc) => ({ doc }));
}

function isLegalSlug(s: string): s is LegalDocSlug {
  return s === "privacy" || s === "terms";
}

export default async function LegalDocPage({
  params,
}: {
  params: Promise<{ doc: string }>;
}) {
  const { doc: slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const doc = LEGAL_DOCS[slug];

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <AppHeader
        right={
          <Button asChild variant="ghost" size="sm">
            <Link href="/legal">
              <ArrowLeft aria-hidden="true" /> Legal
            </Link>
          </Button>
        }
      />
      <main className="flex flex-1 justify-center p-6">
        <article className="flex w-full max-w-[640px] flex-col gap-8">
          <header className="flex flex-col gap-2">
            <Eyebrow as="p" tone="subtle" weight={700} tracking={2}>
              Updated {doc.updated}
            </Eyebrow>
            <h1 className="font-sans text-title font-bold text-foreground">
              {doc.title}
            </h1>
            <p className="text-[14px] leading-relaxed text-muted-foreground">
              {doc.intro}
            </p>
          </header>

          {doc.sections.map((section) => (
            <LegalSection
              key={section.marker}
              id={section.marker.replace("§", "s")}
              marker={section.marker}
              title={section.title}
            >
              {section.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              {section.callout ? (
                <CodeCallout
                  tone={section.callout.tone}
                  title={section.callout.title}
                >
                  {section.callout.body}
                </CodeCallout>
              ) : null}
            </LegalSection>
          ))}
        </article>
      </main>
    </div>
  );
}
