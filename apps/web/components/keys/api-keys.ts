// Shared client-side types + helpers for the BYO AI-key surfaces (the setup
// wizard's keys step and the /settings/keys page). The wire shapes here mirror
// the /api/user/api-keys route's JSON; the raw key is NEVER part of any of
// them — only `configured` + a display-only `last4`.

import { z } from "zod";

export type AiProvider = "anthropic" | "groq";

// Validate the API's JSON at the boundary (repo guideline) — a malformed /
// unexpected response throws a clear error instead of silently becoming a bad
// runtime value behind a type-cast.
const ProviderKeyStateSchema = z.object({
  configured: z.literal(true),
  last4: z.string(),
});
const ApiKeysSnapshotSchema = z.object({
  anthropic: ProviderKeyStateSchema.nullable(),
  groq: ProviderKeyStateSchema.nullable(),
});
const ApiErrorSchema = z.object({ error: z.string().optional() });

/** A single provider's stored state (GET / PUT echo this shape). */
export type ProviderKeyState = z.infer<typeof ProviderKeyStateSchema>;
/** The GET /api/user/api-keys response (and the wizard's seeded snapshot). */
export type ApiKeysSnapshot = z.infer<typeof ApiKeysSnapshotSchema>;

/** Best-effort extraction of an { error } message from a non-2xx body. */
function errorMessage(body: unknown): string | null {
  const parsed = ApiErrorSchema.safeParse(body);
  return parsed.success ? (parsed.data.error ?? null) : null;
}

export const PROVIDER_META: Record<
  AiProvider,
  { label: string; prefix: string; placeholder: string; consoleUrl: string }
> = {
  anthropic: {
    label: "Anthropic",
    prefix: "sk-ant-",
    placeholder: "sk-ant-…",
    consoleUrl: "https://console.anthropic.com/settings/keys",
  },
  groq: {
    label: "Groq",
    prefix: "gsk_",
    placeholder: "gsk_…",
    consoleUrl: "https://console.groq.com/keys",
  },
};

/**
 * Cheap client-side prefix check — mirrors the server's validateKeyFormat so we
 * fail fast before a round-trip. The server re-validates (and the vendor
 * verifies the key for real on the dictation test).
 */
export function validateKeyFormat(provider: AiProvider, key: string): string | null {
  const trimmed = key.trim();
  if (!trimmed) return "Key is required";
  const { prefix, label } = PROVIDER_META[provider];
  if (!trimmed.startsWith(prefix)) {
    return `${label} keys must start with '${prefix}'`;
  }
  return null;
}

/** Save one provider's key (encrypted server-side). Throws on a non-2xx. */
export async function saveApiKey(
  provider: AiProvider,
  key: string,
): Promise<ProviderKeyState> {
  const res = await fetch("/api/user/api-keys", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ provider, key: key.trim() }),
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      errorMessage(body) ??
        `Couldn't save the ${PROVIDER_META[provider].label} key (${res.status}).`,
    );
  }
  const parsed = ProviderKeyStateSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error(
      `Unexpected response saving the ${PROVIDER_META[provider].label} key.`,
    );
  }
  return parsed.data;
}

/** Clear one provider's stored key. Throws on a non-2xx. */
export async function clearApiKey(provider: AiProvider): Promise<void> {
  const res = await fetch(`/api/user/api-keys?provider=${provider}`, {
    method: "DELETE",
  });
  if (!res.ok) {
    throw new Error(
      errorMessage(await res.json().catch(() => null)) ??
        `Couldn't clear the ${PROVIDER_META[provider].label} key (${res.status}).`,
    );
  }
}

/** Load the current per-provider stored state. Throws on a non-2xx. */
export async function fetchApiKeys(): Promise<ApiKeysSnapshot> {
  const res = await fetch("/api/user/api-keys", { method: "GET" });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(
      errorMessage(body) ?? `Couldn't load your keys (${res.status}).`,
    );
  }
  const parsed = ApiKeysSnapshotSchema.safeParse(body);
  if (!parsed.success) {
    throw new Error("Unexpected response loading your keys.");
  }
  return parsed.data;
}
