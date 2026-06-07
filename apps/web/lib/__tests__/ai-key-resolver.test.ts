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

// Regression guards for the BYO key resolution priority + FAIL-CLOSED behaviour
// (apps/web/lib/ai-key-resolver.ts). The db row lookup is mocked so we exercise
// the resolver logic in isolation; the crypto is real (own-key path decrypts a
// real blob). The properties that matter: own stored key wins; the env-var
// fallback is reachable ONLY for a whitelisted email; an EMPTY ALLOWED_EMAILS
// disables the env path entirely; otherwise it throws NoAiKeyError (→ 402).

vi.mock("@opsboard/db", () => ({ createHttpDb: () => ({}) }));
vi.mock("@opsboard/db/api-keys", () => ({ getUserApiKeyRow: vi.fn() }));

const getRow = vi.mocked(getUserApiKeyRow);
const KEY_B64 = Buffer.alloc(32, 7).toString("base64");
const USER = "user_A";
const EMAIL = "owner@example.com";

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

describe("resolveAiKey", () => {
  it("returns the user's own stored key (decrypted) when present", async () => {
    const blob = encryptKey("sk-ant-mykey", {
      userId: USER,
      provider: "anthropic",
    });
    getRow.mockResolvedValue({
      anthropicKeyEncrypted: blob,
      groqKeyEncrypted: null,
    } as Awaited<ReturnType<typeof getUserApiKeyRow>>);
    await expect(resolveAiKey(USER, EMAIL, "anthropic")).resolves.toBe(
      "sk-ant-mykey",
    );
  });

  it("FAILS CLOSED with no stored key and empty ALLOWED_EMAILS — even if env keys are set", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-ENV";
    // ALLOWED_EMAILS unset → the env path is skipped entirely (pure BYO).
    await expect(resolveAiKey(USER, EMAIL, "anthropic")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });

  it("uses the env key only when the caller's email is whitelisted", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-ENV";
    process.env.ALLOWED_EMAILS = "other@x.com, owner@example.com";
    await expect(resolveAiKey(USER, EMAIL, "anthropic")).resolves.toBe(
      "sk-ant-ENV",
    );
  });

  it("FAILS CLOSED when the email is NOT whitelisted (despite an env key)", async () => {
    process.env.ANTHROPIC_API_KEY = "sk-ant-ENV";
    process.env.ALLOWED_EMAILS = "someoneelse@x.com";
    await expect(resolveAiKey(USER, EMAIL, "anthropic")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });

  it("FAILS CLOSED when whitelisted but the env key is absent", async () => {
    process.env.ALLOWED_EMAILS = EMAIL;
    await expect(resolveAiKey(USER, EMAIL, "groq")).rejects.toBeInstanceOf(
      NoAiKeyError,
    );
  });

  it("resolves groq independently of anthropic", async () => {
    process.env.GROQ_API_KEY = "gsk_ENV";
    process.env.ALLOWED_EMAILS = EMAIL;
    await expect(resolveAiKey(USER, EMAIL, "groq")).resolves.toBe("gsk_ENV");
  });
});
