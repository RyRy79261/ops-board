import { listClientApiKeys } from "@opsboard/db/client-api-keys";
import { getSessionUser } from "@/lib/session";
import { ApiAccessSettings, type AccessKeyView } from "./api-access-settings";

// /settings/api-access — programmatic API keys for the /api/v1 REST surface
// (docs/research-delegate-v2.md §v2a). Keys are minted and revoked HERE ONLY
// (session auth), never over /api/v1 or MCP, so a leaked credential can't
// mint more credentials. Server-seeds the list; the client owns mutations.
export const dynamic = "force-dynamic";

export default async function ApiAccessSettingsPage() {
  const { userId } = await getSessionUser();
  const keys = await listClientApiKeys(userId);

  const initialKeys: AccessKeyView[] = keys.map((k) => ({
    id: k.id,
    name: k.name,
    prefix: k.prefix,
    createdAt: k.createdAt.toISOString(),
    lastUsedAt: k.lastUsedAt ? k.lastUsedAt.toISOString() : null,
    revokedAt: k.revokedAt ? k.revokedAt.toISOString() : null,
  }));

  return <ApiAccessSettings initialKeys={initialKeys} />;
}
