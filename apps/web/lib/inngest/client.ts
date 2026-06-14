import { EventSchemas, Inngest } from "inngest";

// The OpsBoard Inngest client — the durable background runner for AI Research
// jobs. Provisioned via the Vercel↔Inngest integration: INNGEST_EVENT_KEY (auth
// for inngest.send) and INNGEST_SIGNING_KEY (verifies the /api/inngest serve
// endpoint Inngest calls back) are injected as Vercel env vars; the SDK reads
// them automatically, so no key plumbing here.

/** The event map — typing it makes inngest.send + createFunction compile-checked. */
type OpsboardEvents = {
  /** Kicks off a research job (sent by /api/research on CUE RESEARCH). */
  "research/job.requested": { data: { jobId: string; userId: string } };
};

// The id namespaces this app's functions + events in the Inngest dashboard; the
// schemas make event names + payloads type-safe on both send and consume.
export const inngest = new Inngest({
  id: "opsboard",
  schemas: new EventSchemas().fromRecord<OpsboardEvents>(),
});
