import { expect, test } from "@playwright/test";
import { mockSession } from "../helpers/e2e";

test("TC-AUTO-010: crea un proyecto vacío desde el dashboard", async ({ page }) => {
  await mockSession(page);
  await page.goto("/dashboard");
  await page.getByRole("button", { name: "Volver al editor" }).click();
  await expect(page).toHaveURL(/\/$/);
  await page.locator("input.project-name-input").fill("Test_Project_Auto");
  await expect(page.getByRole("figure", { name: /Begin stack/ })).toBeVisible();
});
