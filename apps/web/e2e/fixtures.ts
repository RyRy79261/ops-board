import { test as base, expect } from "@playwright/test";
import { E2E_USER, resetData } from "./seed";

const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://127.0.0.1:${PORT}`;

/** base64-encoded JSON principal — mirrors the decode in lib/session-e2e.ts. */
function authCookieValue(): string {
  return Buffer.from(JSON.stringify(E2E_USER)).toString("base64");
}

// Every test gets a CLEAN database (domain data wiped, categories + user
// reseeded) and is pre-authenticated as the seeded e2e user via the `e2e-user`
// cookie the session seam reads. Auto-applied so specs read like a logged-in
// session; a spec can `context.clearCookies()` to exercise the unauth path.
export const test = base.extend<{ authed: void }>({
  authed: [
    async ({ context }, use) => {
      await resetData();
      await context.addCookies([
        { name: "e2e-user", value: authCookieValue(), url: BASE_URL },
      ]);
      await use();
    },
    { auto: true },
  ],
});

export { expect, E2E_USER };
