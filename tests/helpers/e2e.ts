import { expect, type Page } from "@playwright/test";

const authApi = "**/auth-service/usuario";

export async function mockSession(page: Page, user = {
  id: "e2e-user",
  nombre: "Maria Garcia",
  email: "maria.garcia@correo.com",
  rol: ["admin"],
}) {
  await page.route(`${authApi}/verifyToken`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(user) });
  });
  await page.route(`${authApi}/refreshToken`, async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: "Token invalido" }) });
  });
  await page.route(`${authApi}/logout`, async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true }) });
  });
  await page.route("http://localhost:3000/api/arduino/ports", async (route) => {
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, ports: [] }) });
  });
}

export async function mockLogin(page: Page, successful = true) {
  await page.route(`${authApi}/login`, async (route) => {
    await route.fulfill({
      status: successful ? 200 : 401,
      contentType: "application/json",
      body: JSON.stringify(successful ? { ok: true, user: { email: "maria.garcia@correo.com" } } : { error: "Credenciales inválidas" }),
    });
  });
}

export async function openEditor(page: Page) {
  await mockSession(page);
  await page.goto("/");
  await expectEditor(page);
}

export async function expectEditor(page: Page) {
  await page.getByRole("region", { name: "Blocks workspace." }).waitFor({ state: "visible", timeout: 15_000 });
}
