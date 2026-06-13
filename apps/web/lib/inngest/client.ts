import { Inngest } from "inngest";

// The OpsBoard Inngest client — the durable background runner for AI Research
// jobs. Provisioned via the Vercel↔Inngest integration: INNGEST_EVENT_KEY (auth
// for inngest.send) and INNGEST_SIGNING_KEY (verifies the /api/inngest serve
// endpoint Inngest calls back) are injected as Vercel env vars; the SDK reads
// them automatically, so no key plumbing here.
//
// The id namespaces this app's functions + events in the Inngest dashboard.
export const inngest = new Inngest({ id: "opsboard" });

/** The event that kicks off a research job (sent by /api/research on CUE RESEARCH). */
export interface ResearchJobRequested {
  name: "research/job.requested";
  data: { jobId: string; userId: string };
}
