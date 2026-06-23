import { expect, type Page, type Locator } from "@playwright/test";

/**
 * Click a button by accessible name, retrying until `appears` becomes visible.
 *
 * `next dev` serves SSR HTML that React hydrates a tick later, so the FIRST
 * click after any navigation can land before the onClick handler is attached
 * (the dialog never opens). Retrying the click until the expected element shows
 * is the robust, Playwright-recommended fix for that hydration race. The open
 * handlers here are idempotent (`setOpen(true)`), so an extra click is harmless.
 */
export async function clickUntil(
  page: Page,
  buttonName: string,
  appears: Locator,
): Promise<void> {
  await expect(async () => {
    await page.getByRole("button", { name: buttonName, exact: true }).click();
    await expect(appears).toBeVisible({ timeout: 2000 });
  }).toPass({ timeout: 30_000 });
}

/** Create a mission via the non-voice form and wait for the board to show it. */
export async function createMission(
  page: Page,
  name: string,
  targetDate?: string,
): Promise<void> {
  await clickUntil(page, "New mission", page.getByLabel("Mission name"));
  await page.getByLabel("Mission name").fill(name);
  if (targetDate) {
    await page.getByLabel("Target date").fill(targetDate);
  }
  await page.getByRole("button", { name: "Create mission", exact: true }).click();
  await expect(page.getByText(name).first()).toBeVisible();
}
