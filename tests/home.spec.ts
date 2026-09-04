import { expect, test } from "@playwright/test";
import { mockSession } from "./helpers/e2e";

test("TC-AUTO-003: carga correcta del dashboard del editor", async ({ page }) => {
  await mockSession(page);
  await page.goto("/");
  await expect(page).toHaveTitle("1bot");
  await expect(page.locator(".app-container")).toBeVisible();
});
