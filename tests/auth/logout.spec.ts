import { expect, test } from "@playwright/test";
import { mockSession } from "../helpers/e2e";

test("TC-AUTO-008: cierre de sesión exitoso", async ({ page }) => {
  await mockSession(page);
  await page.goto("/");
  await page.getByRole("button", { name: "Salir" }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
  await expect.poll(() => page.evaluate(() => Object.keys(localStorage).filter((key) => /token|auth/i.test(key)))).toEqual([]);
});
