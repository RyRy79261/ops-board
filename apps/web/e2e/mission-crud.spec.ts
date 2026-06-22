import { test, expect } from "./fixtures";
import { clickUntil, createMission } from "./helpers";

// The non-voice mission CRUD surface (PR #40). The mission Settings control is a
// <button> ("Settings"); the global SettingsLink is an <a> (role=link), so
// getByRole("button", { name: "Settings" }) targets the mission dialog only.

test.describe("mission CRUD", () => {
  test("create a mission from the empty state", async ({ page }) => {
    await page.goto("/");
    await createMission(page, "Operation Verify", "2026-12-01");
    await expect(page.getByText("Operation Verify").first()).toBeVisible();
  });

  // Regression for the #42 data-loss bug: a name-only edit must NOT wipe the
  // target date (the bug was DateField's transform sitting outside .optional(),
  // so an omitted targetDate parsed to null and overwrote the column).
  test("name-only edit preserves the target date", async ({ page }) => {
    await page.goto("/");
    await createMission(page, "Dated Mission", "2026-09-15");

    // Edit ONLY the name.
    await clickUntil(page, "Settings", page.getByLabel("Mission name"));
    await expect(page.getByLabel("Mission name")).toHaveValue("Dated Mission");
    await page.getByLabel("Mission name").fill("Renamed Mission");
    await page.getByRole("button", { name: "Save", exact: true }).click();
    await expect(page.getByText(/Saved/)).toBeVisible();

    // Reopen Settings after a reload — the date must still be set.
    await page.reload();
    await clickUntil(page, "Settings", page.getByLabel("Target date"));
    await expect(page.getByLabel("Target date")).toHaveValue("2026-09-15");
    await expect(page.getByLabel("Mission name")).toHaveValue("Renamed Mission");
  });

  test("delete a mission via type-to-confirm", async ({ page }) => {
    await page.goto("/");
    await createMission(page, "Doomed Mission");

    await clickUntil(
      page,
      "Settings",
      page.getByRole("button", { name: "Delete", exact: true }),
    );
    await page.getByRole("button", { name: "Delete", exact: true }).click();
    await page
      .getByLabel("Type the mission name to confirm")
      .fill("Doomed Mission");
    await page
      .getByRole("button", { name: "Delete forever", exact: true })
      .click();

    // Back to the no-missions empty state.
    await expect(
      page.getByRole("button", { name: "New mission", exact: true }),
    ).toBeVisible();
    await expect(page.getByText("Doomed Mission")).toHaveCount(0);
  });
});
