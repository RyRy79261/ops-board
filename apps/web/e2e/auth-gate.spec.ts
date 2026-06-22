import { test, expect } from "./fixtures";

// The auth gate: without a valid `e2e-user` cookie the board denies access and
// redirects to /auth (the seam treats a missing cookie as unauthenticated).
test("board redirects to /auth when unauthenticated", async ({
  page,
  context,
}) => {
  await context.clearCookies();
  await page.goto("/");
  await expect(page).toHaveURL(/\/auth/);
});
