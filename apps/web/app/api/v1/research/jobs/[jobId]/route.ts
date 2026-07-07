import { getResearchJob } from "@opsboard/db/research";
import { toResearchJobView } from "@/lib/research-types";
import { runV1, notFoundV1 } from "../../../_lib/v1";
import { requireUuid } from "../../../_lib/schemas";

// GET /api/v1/research/jobs/[jobId] — poll a research job (REST mirror of the
// MCP get_research_job tool; same serialized view the web UI polls). Poll
// every ~5-8s with light backoff until state is terminal.

export const runtime = "nodejs";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> },
): Promise<Response> {
  return runV1({
    req,
    op: "v1.get_research_job",
    handler: async (p) => {
      const jobId = requireUuid((await params).jobId);
      const job = await getResearchJob(jobId, p.userId);
      if (!job) notFoundV1("No research job with that id.");
      return { job: toResearchJobView(job!) };
    },
  });
}
