import { expect, test } from "@playwright/test";

const authUrl = process.env.AUTH_API_URL ?? "http://localhost:3001/auth-service";

test("TC-AUTO-006: responde correctamente el endpoint de autenticación", async ({ request }) => {
  const response = await request.post(`${authUrl}/usuario/login`, {
    data: { email: "maria.garcia@correo.com", password: "password123" },
  });
  expect(response.status()).toBe(200);
  const body = await response.json();
  const token = body.token ?? body.accessToken ?? response.headers()["set-cookie"];
  expect(token).toBeTruthy();
  if (typeof token === "string" && !token.includes("=")) {
    expect(token.split(".")).toHaveLength(3);
  }
});
