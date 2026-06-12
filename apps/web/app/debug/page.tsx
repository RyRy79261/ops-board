import { getSessionUser } from "@/lib/session";
import { DebugSurface } from "./debug-surface";

// /debug — operator diagnostics. Seeds server-side info (env / build / session)
// from the RSC; the client surface adds browser info + the real client error
// buffer. force-dynamic: per-session read.
export const dynamic = "force-dynamic";

export default async function DebugPage() {
  const { userId, email } = await getSessionUser();
  return (
    <DebugSurface
      server={{
        env: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "unknown",
        commit: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
        email: email ?? "—",
        userId,
      }}
    />
  );
}
