import { expect, test } from "@playwright/test";

const arduinoUrl = process.env.ARDUINO_API_URL ?? "http://localhost:3000";

test("TC-AUTO-007: consulta los puertos de Arduino", async ({ request }) => {
  const response = await request.get(`${arduinoUrl}/api/arduino/ports`);
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.ok).toBe(true);
  expect(body.ports).toEqual(expect.any(Array));
});
