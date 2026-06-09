import { redirect } from "next/navigation";
import { createHttpDb } from "@opsboard/db";
import { getUserApiKeyRow, getUserSetupCompletedAt } from "@opsboard/db/api-keys";
import { getSessionUser } from "@/lib/session";
import { SetupWizard } from "./setup-wizard";

// The BYO-keys onboarding gate. A signed-in user who hasn't finished setup
// (users.setup_completed_at IS NULL) lands here; finishing flips the gate and
// opens the board (see requireOnboardedUser in lib/session.ts).
//
// force-dynamic: reads the session cookie + a per-user DB row, so it can't be
// statically prerendered.
export const dynamic = "force-dynamic";

/**
 * /setup — the onboarding wizard host.
 *
 * IMPORTANT: this page uses getSessionUser (require auth ONLY), NOT
 * requireOnboardedUser — the latter would redirect("/setup") for the very
 * un-onboarded user this page exists to serve, looping forever. Instead we read
 * setup_completed_at here directly and, if it's already set, send the user home;
 * otherwise we render the wizard, seeded with whatever keys are already stored
 * (so a returning, mid-setup user resumes rather than restarts).
 */
export default async function SetupPage() {
  const { userId } = await getSessionUser();

  const db = createHttpDb();
  const completedAt = await getUserSetupCompletedAt(userId, db);
  if (completedAt !== null) {
    redirect("/");
  }

  // Seed the wizard's keys step with the already-stored providers (display-only
  // last4 — the raw key is never read here, only the encrypted-blob presence).
  const keyRow = await getUserApiKeyRow(userId, db);

  return (
    <SetupWizard
      initialKeys={{
        anthropic: keyRow?.anthropicKeyEncrypted
          ? { configured: true, last4: keyRow.anthropicLast4 ?? "" }
          : null,
        groq: keyRow?.groqKeyEncrypted
          ? { configured: true, last4: keyRow.groqLast4 ?? "" }
          : null,
      }}
    />
  );
}
