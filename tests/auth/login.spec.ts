import { expect, test } from "@playwright/test";
import { mockLogin, mockSession } from "../helpers/e2e";

test("TC-AUTO-001: inicio de sesión exitoso con credenciales válidas", async ({ page }) => {
  await mockLogin(page);
  await mockSession(page);
  await page.goto("/login");
  await page.getByLabel("Correo").fill("maria.garcia@correo.com");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("password123");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page).toHaveTitle("1bot");
});
