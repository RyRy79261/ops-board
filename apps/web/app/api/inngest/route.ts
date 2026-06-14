import { serve } from "inngest/next";

import { inngest } from "@/lib/inngest/client";
import { researchJob } from "@/lib/inngest/functions/research-job";

// The Inngest serve endpoint — Inngest calls this (server-to-server, signed with
// INNGEST_SIGNING_KEY which the SDK verifies) to register + drive each function
// step. It is NOT page-gated (proxy.ts skips /api/*) and needs no withAuth: the
// signature is the auth. Each step runs inside one Vercel invocation, so cap the
// duration at the Hobby ceiling.
export const runtime = "nodejs";
export const maxDuration = 60;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [researchJob],
});
