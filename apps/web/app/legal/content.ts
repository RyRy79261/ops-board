import type { CodeCalloutTone } from "@opsboard/ui/components/code-callout";

// Legal document content. PLACEHOLDER COPY — structure is final, the words are
// drafts for the operator to replace before any public / app-store launch. Kept
// as plain data so the routes stay thin (the pages map sections → LegalSection +
// CodeCallout). Not legal advice; review with counsel before relying on it.

export type LegalDocSlug = "privacy" | "terms";

export interface LegalSectionData {
  marker: string;
  title: string;
  paragraphs: string[];
  callout?: { tone: CodeCalloutTone; title: string; body: string };
}

export interface LegalDoc {
  slug: LegalDocSlug;
  title: string;
  description: string;
  /** Pre-formatted "updated" date for the index row + header. */
  updated: string;
  intro: string;
  sections: LegalSectionData[];
}

export const LEGAL_DOCS: Record<LegalDocSlug, LegalDoc> = {
  privacy: {
    slug: "privacy",
    title: "Privacy Policy",
    description: "What OpsBoard stores, why, and the controls you have.",
    updated: "12 JUN 2026",
    intro:
      "[PLACEHOLDER] This policy explains what data OpsBoard holds and how it's handled. Replace this draft with your reviewed copy before launch.",
    sections: [
      {
        marker: "§01",
        title: "Data we store",
        paragraphs: [
          "OpsBoard stores the missions and tasks you create, their dependencies and status, and your app preferences.",
          "Your AI provider keys are stored encrypted at rest. We never store the raw key material, and only the last four characters are ever shown back to you.",
        ],
        callout: {
          tone: "info",
          title: "Your keys",
          body: "Keys are encrypted with AES-256-GCM and are never returned to the browser or included in your data export.",
        },
      },
      {
        marker: "§02",
        title: "Voice data",
        paragraphs: [
          "When you hold the voice button, audio is sent to your configured speech provider to produce a transcript. The transcript populates your task.",
        ],
        callout: {
          tone: "warning",
          title: "Retention",
          body: "Raw audio clips are retained for 30 days so you can replay or re-transcribe them, then automatically deleted.",
        },
      },
      {
        marker: "§03",
        title: "Your controls",
        paragraphs: [
          "You can export all of your data as JSON at any time, and you can permanently delete your account and all associated data from the Account screen.",
        ],
      },
    ],
  },
  terms: {
    slug: "terms",
    title: "Terms of Service",
    description: "The agreement for using OpsBoard.",
    updated: "12 JUN 2026",
    intro:
      "[PLACEHOLDER] These terms govern your use of OpsBoard. Replace this draft with your reviewed copy before launch.",
    sections: [
      {
        marker: "§01",
        title: "Bring your own keys",
        paragraphs: [
          "OpsBoard runs on AI provider keys you supply. You are responsible for your providers' usage, billing, and terms. OpsBoard does not provide or pay for AI usage on your behalf.",
        ],
      },
      {
        marker: "§02",
        title: "Acceptable use",
        paragraphs: [
          "Use OpsBoard for lawful purposes only. Do not use it to violate the terms of your AI providers or any applicable law.",
        ],
      },
      {
        marker: "§03",
        title: "No warranty",
        paragraphs: [
          "OpsBoard is provided “as is”, without warranties of any kind. To the maximum extent permitted by law, it is provided without liability for any damages arising from its use.",
        ],
        callout: {
          tone: "warning",
          title: "Draft",
          body: "This limitation-of-liability language is placeholder text and must be reviewed by counsel before launch.",
        },
      },
    ],
  },
};

export const LEGAL_INDEX: LegalDoc[] = [LEGAL_DOCS.privacy, LEGAL_DOCS.terms];
