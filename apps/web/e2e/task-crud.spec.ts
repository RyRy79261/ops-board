import { test, expect } from "./fixtures";
import { clickUntil, createMission } from "./helpers";

test.describe("task CRUD", () => {
  test("create a task with the default General category", async ({ page }) => {
    await page.goto("/");
    await createMission(page, "Task Host Mission");

    await clickUntil(page, "Add task", page.getByLabel("Task name"));
    await page.getByLabel("Task name").fill("Pack the truck");
    await page.getByRole("button", { name: "Create task", exact: true }).click();

    await expect(page.getByText("Pack the truck").first()).toBeVisible();
  });

  test("create a task in a specific category renders that category", async ({
    page,
  }) => {
    await page.goto("/");
    await createMission(page, "Categorised Mission");

    await clickUntil(page, "Add task", page.getByLabel("Task name"));
    await page.getByLabel("Task name").fill("Book the doctor");
    await page
      .getByLabel("Category", { exact: true })
      .selectOption({ label: "Medical" });
    await page.getByRole("button", { name: "Create task", exact: true }).click();

    await expect(page.getByText("Book the doctor").first()).toBeVisible();
    // The data-driven category system surfaces the Medical category on the board
    // (group header / tag) once a task lives in it. The form dialog has closed,
    // so the only "Medical" left is the visible board label.
    await expect(page.getByText(/Medical/i).first()).toBeVisible();
  });
});
