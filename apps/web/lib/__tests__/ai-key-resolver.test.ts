import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from "vitest";
import { encryptKey } from "@/lib/key-vault";
import { NoAiKeyError, resolveAiKey } from "@/lib/ai-key-resolver";
import { getUserApiKeyRow } from "@opsboard/db/api-keys";

// Regression guards for PURE BYO key resolution (apps/web/lib/ai-key-resolver.ts).
// Model B: EVERY user brings their own keys — there is NO env-var key and NO
// email whitelist. The db row lookup is mocked so we exercise the resolver in
// isolation; the crypto is real (the own-key path decrypts a real blob). The
// properties that matter: the user's own stored key resolves; WITHOUT a stored
// key it ALWAYS throws NoAiKeyError (→ 402), even when ANTHROPIC_API_KEY /
// GROQ_API_KEY / ALLOWED_EMAILS are set in the env — those env vars are dead.

vi.mock("@opsboard/db", () => ({ createHttpDb: () => ({}) }));
vi.mock("@opsboard/db/api-keys", () => ({ getUserApiKeyRow: vi.fn() }));

const getRow = vi.mocked(getUserApiKeyRow);
const KEY_B64 = Buffer.alloc(32, 7).toString("base64");
const USER = "user_A";

// These env vars MUST be dead in pure BYO — we set them in the fail-closed
// tests to prove they're never consulted.
const ENV_KEYS = [
  "API_KEY_ENCRYPTION_SECRET",
  "ALLOWED_EMAILS",
  "ANTHROPIC_API_KEY",
  "GROQ_API_KEY",
] as const;
let saved: Record<string, string | undefined>;

beforeEach(() => {
  saved = {};
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  process.env.API_KEY_ENCRYPTION_SECRET = KEY_B64;
  delete process.env.ALLOWED_EMAILS;
  delete process.env.ANTHROPIC_API_KEY;
  delete process.env.GROQ_API_KEY;
  getRow.mockReset();
  getRow.mockResolvedValue(null); // default: no stored key for this user
});
afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

describe("resolveAiKey (pure BYO)", () => {
  it("returns the user's own stored key (decrypted) when present", async () => {
    const blob = encryptKey("sk-ant-mykey", {
      userId: USER,
      provider: "anthropic",
    });
    getRow.mockResolvedValue({
      anthropicKeyEncrypted: blob,
      groqKeyEncrypted: null,
    } as Awaited<ReturnType<typeof getUserApiKeyRow>>);
    await expect(resolveAiKey(USER, "anthropic")).resolves.toBe("sk-ant-mykey");
  });

  it("resolves the groq key independently of anthropic", async () => {
    const blob = encryptKey("gsk_mykey", { userId: USER, provider: "groq" });
    getRow.mockResolvedValue({
      anthropicKeyEncrypted: null,
      groqKeyEncrypted: blob,
    } as Awaited<ReturnType<typeof getUserApiKeyRow>>);
    await expect(resolveAiKey(USER, "groq")).resolves.toBe("gsk_mykey");
  });

  it("FAILS CLOSED with no stored key — even when the env keys are set", async () => {
    // Pure BYO: these env vars are DEAD. Setting them must change nothing.
    process.env.ANTHROPIC_API_KEY = "sk-ant-ENV";
    process.env.GROQ_API_KEY = "gsk_ENV";
    await expect(resolveAiKey(USER, "anthropic")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
    await expect(resolveAiKey(USER, "groq")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });

  it("FAILS CLOSED even when ALLOWED_EMAILS would have whitelisted the env key", async () => {
    // The whitelist branch is GONE — a populated ALLOWED_EMAILS + env key is
    // still not a path to a key.
    process.env.ANTHROPIC_API_KEY = "sk-ant-ENV";
    process.env.ALLOWED_EMAILS = "owner@example.com";
    await expect(resolveAiKey(USER, "anthropic")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });

  it("FAILS CLOSED when the stored row exists but lacks this provider's blob", async () => {
    getRow.mockResolvedValue({
      anthropicKeyEncrypted: null,
      groqKeyEncrypted: "v1:something",
    } as Awaited<ReturnType<typeof getUserApiKeyRow>>);
    await expect(resolveAiKey(USER, "anthropic")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });
});
