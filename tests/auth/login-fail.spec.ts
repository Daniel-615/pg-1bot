import { expect, test } from "@playwright/test";
import { mockLogin } from "../helpers/e2e";

test("TC-AUTO-002: rechaza contraseña incorrecta", async ({ page }) => {
  await mockLogin(page, false);
  await page.goto("/login");
  await page.getByLabel("Correo").fill("maria.garcia@correo.com");
  await page.getByRole("textbox", { name: "Contraseña" }).fill("wrongpassword");
  await page.getByRole("button", { name: "Iniciar Sesión" }).click();
  await expect(page.getByText("Credenciales inválidas")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});
