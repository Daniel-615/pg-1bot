import { expect, test, type Page } from "@playwright/test";

const authApi = "**/auth-service/usuario";

async function mockAuthenticatedSession(page: Page) {
  await page.route(`${authApi}/verifyToken`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "e2e-user",
        nombre: "Usuario E2E",
        email: "e2e@1bot.test",
        rol: ["admin"],
      }),
    });
  });

  await page.route(`${authApi}/refreshToken`, async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: "Token invalido" }) });
  });

  await page.route("http://localhost:3000/api/arduino/ports", async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ ok: true, ports: [] }),
    });
  });
}

test("redirige al login cuando no existe una sesion", async ({ page }) => {
  await page.route(`${authApi}/verifyToken`, async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: "Sesion invalida" }) });
  });
  await page.route(`${authApi}/refreshToken`, async (route) => {
    await route.fulfill({ status: 401, body: JSON.stringify({ error: "Token invalido" }) });
  });

  await page.goto("/");

  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByRole("heading", { name: "Bienvenido" })).toBeVisible();
  await expect(page.getByLabel("Correo")).toBeVisible();
});

test("muestra validacion al enviar login vacio", async ({ page }) => {
  await page.goto("/login");

  await page.getByRole("button", { name: "Iniciar Sesión" }).click();

  await expect(page.getByText("Ingresa correo y contraseña")).toBeVisible();
  await expect(page).toHaveURL(/\/login$/);
});

test("permite mostrar y ocultar la contraseña en login", async ({ page }) => {
  await page.goto("/login");
  const password = page.getByRole("textbox", { name: "Contraseña" });

  await expect(password).toHaveAttribute("type", "password");
  await page.getByRole("button", { name: "Mostrar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await expect(page.getByRole("button", { name: "Ocultar contraseña" })).toBeVisible();

  await page.getByRole("button", { name: "Ocultar contraseña" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("valida que las contraseñas de registro coincidan", async ({ page }) => {
  await page.goto("/register");

  await page.getByLabel("Nombre").fill("Maria");
  await page.getByLabel("Apellido").fill("Garcia");
  await page.getByLabel("Correo").fill("maria@1bot.test");
  await page.getByLabel("Contraseña", { exact: true }).fill("secreta123");
  await page.getByLabel("Confirmar contraseña").fill("diferente123");
  await page.getByRole("button", { name: "Crear Cuenta" }).click();

  await expect(page.getByText("Las contraseñas no coinciden")).toBeVisible();
  await expect(page).toHaveURL(/\/register$/);
});

test("permite usar el editor autenticado y cambiar sus vistas", async ({ page }) => {
  await mockAuthenticatedSession(page);
  await page.goto("/");

  await expect(page.locator("input.project-name-input")).toHaveValue("Sin titulo");
  await expect(page.getByText("Usuario E2E")).toBeVisible();

  await page.getByRole("button", { name: "ESP32" }).click();
  await page.getByRole("button", { name: "Arduino Uno" }).last().click();
  await expect(page.getByRole("button", { name: "Arduino Uno", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.getByRole("button", { name: "Code", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Debug" }).click();
  await expect(page.getByRole("heading", { name: "Symbol table" })).toBeVisible();

  await page.getByRole("button", { name: "Simulator" }).click();
  await expect(page.getByText("Wokwi", { exact: true })).toBeVisible();
  await expect(page.getByText("Wokwi circuit preview", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Examples" }).click();
  await expect(page.getByRole("heading", { name: "Examples" })).toBeVisible();
});
