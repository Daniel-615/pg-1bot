import { expect, test } from "@playwright/test";

test("Carga correcta de la aplicación", async ({ page }) => {
  await page.goto("/");

  await expect(page).toHaveTitle("1bot");
});
