import { test, expect } from "./fixtures";

// The CSP / Permissions-Policy are easy to get subtly wrong (inline styles,
// hydration scripts). This asserts the headers are present AND that the board
// still renders under them — the mission/task CRUD specs exercising dialogs
// (inline-styled pills) + status cycling under the same policy are the deeper
// functional check.
test("security response headers are present and the board renders under them", async ({
  page,
}) => {
  const res = await page.goto("/");
  expect(res).not.toBeNull();
  const headers = res!.headers();

  const csp = headers["content-security-policy"] ?? "";
  expect(csp).toContain("default-src 'self'");
  expect(csp).toContain("frame-ancestors 'none'");
  expect(csp).toContain("object-src 'none'");
  expect(headers["permissions-policy"] ?? "").toContain("microphone=(self)");
  expect(headers["x-frame-options"]).toBe("DENY");

  // The board renders under the CSP — no inline-style / hydration breakage.
  await expect(
    page.getByRole("button", { name: "New mission", exact: true }),
  ).toBeVisible();
});
