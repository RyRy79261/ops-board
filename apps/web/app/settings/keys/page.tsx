import { createHttpDb } from "@opsboard/db";
import { getUserApiKeyRow } from "@opsboard/db/api-keys";
import { getSessionUser } from "@/lib/session";
import { KeysSettings } from "./keys-settings";

// Per-user BYO AI-key management. Reachable post-onboarding from the board
// header. Uses getSessionUser (auth only) rather than requireOnboardedUser: a
// user could land here mid-setup, and the page works fine either way (it just
// reads/writes the same keys the wizard does). force-dynamic: per-user DB read.
export const dynamic = "force-dynamic";

/**
 * /settings/keys — view configured providers (last4 only, never the raw key),
 * update (PUT) or clear (DELETE) each. Server-seeds the initial snapshot so the
 * first paint is correct; the client component then owns mutations.
 */
export default async function KeysSettingsPage() {
  const { userId } = await getSessionUser();

  const keyRow = await getUserApiKeyRow(userId, createHttpDb());

  return (
    <KeysSettings
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
