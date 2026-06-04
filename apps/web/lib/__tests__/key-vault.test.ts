import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { decryptKey, encryptKey, lastFourOf } from "@/lib/key-vault";

// Regression guards for the BYO key-vault crypto (apps/web/lib/key-vault.ts).
// The properties that matter for security: authenticated AES-256-GCM round-trip,
// AAD binding to {userId, provider} (a row can't be replayed under a different
// owner/provider), tamper rejection, and strict master-key handling.

// A deterministic, valid 32-byte master key (base64). Real deployments use
// `openssl rand -base64 32`; a fixed buffer keeps the test reproducible.
const KEY_B64 = Buffer.alloc(32, 7).toString("base64");
const AAD = { userId: "user_A", provider: "anthropic" as const };

let prev: string | undefined;
beforeEach(() => {
  prev = process.env.API_KEY_ENCRYPTION_SECRET;
  process.env.API_KEY_ENCRYPTION_SECRET = KEY_B64;
});
afterEach(() => {
  if (prev === undefined) delete process.env.API_KEY_ENCRYPTION_SECRET;
  else process.env.API_KEY_ENCRYPTION_SECRET = prev;
});

describe("key-vault", () => {
  it("round-trips a value with matching AAD and emits a v1 4-part blob", () => {
    const blob = encryptKey("sk-ant-secret123", AAD);
    expect(blob.startsWith("v1:")).toBe(true);
    expect(blob.split(":")).toHaveLength(4);
    expect(decryptKey(blob, AAD)).toBe("sk-ant-secret123");
  });

  it("uses a fresh IV per encryption (same plaintext → different ciphertext)", () => {
    const a = encryptKey("same", AAD);
    const b = encryptKey("same", AAD);
    expect(a).not.toBe(b);
    expect(decryptKey(a, AAD)).toBe("same");
    expect(decryptKey(b, AAD)).toBe("same");
  });

  it("rejects decryption under a different userId (AAD binding)", () => {
    const blob = encryptKey("secret", AAD);
    expect(() => decryptKey(blob, { ...AAD, userId: "user_B" })).toThrow();
  });

  it("rejects decryption under a different provider (AAD binding)", () => {
    const blob = encryptKey("secret", AAD);
    expect(() =>
      decryptKey(blob, { userId: "user_A", provider: "groq" }),
    ).toThrow();
  });

  it("rejects a tampered ciphertext (GCM auth tag)", () => {
    const [v, iv, tag, ct] = encryptKey("secret", AAD).split(":") as [
      string,
      string,
      string,
      string,
    ];
    const ctBuf = Buffer.from(ct, "base64");
    ctBuf[0] = ((ctBuf[0] ?? 0) ^ 0xff) & 0xff; // flip a byte
    const tampered = [v, iv, tag, ctBuf.toString("base64")].join(":");
    expect(() => decryptKey(tampered, AAD)).toThrow();
  });

  it("accepts a 64-char hex master key as well as base64", () => {
    process.env.API_KEY_ENCRYPTION_SECRET = Buffer.alloc(32, 9).toString("hex");
    const blob = encryptKey("hexsecret", AAD);
    expect(decryptKey(blob, AAD)).toBe("hexsecret");
  });

  it("throws when the master key is missing", () => {
    delete process.env.API_KEY_ENCRYPTION_SECRET;
    expect(() => encryptKey("x", AAD)).toThrow(/API_KEY_ENCRYPTION_SECRET/);
  });

  it("throws when the master key decodes to the wrong length", () => {
    process.env.API_KEY_ENCRYPTION_SECRET = Buffer.alloc(16, 1).toString(
      "base64",
    );
    expect(() => encryptKey("x", AAD)).toThrow(/32 bytes/);
  });

  it("rejects empty plaintext and empty blob", () => {
    expect(() => encryptKey("", AAD)).toThrow();
    expect(() => decryptKey("", AAD)).toThrow();
  });

  it("rejects an unknown blob version and a malformed v1 blob", () => {
    expect(() => decryptKey("v9:whatever", AAD)).toThrow(
      /Unknown key blob version/,
    );
    expect(() => decryptKey("v1:onlyonepart", AAD)).toThrow(/Malformed/);
  });

  it("lastFourOf returns at most the trailing 4 characters", () => {
    expect(lastFourOf("sk-ant-abcd1234")).toBe("1234");
    expect(lastFourOf("ab")).toBe("ab");
    expect(lastFourOf("")).toBe("");
  });
});
