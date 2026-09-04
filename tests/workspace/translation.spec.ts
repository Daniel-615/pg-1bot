import { expect, test } from "@playwright/test";
import { openEditor } from "../helpers/e2e";

test("TC-AUTO-005: traduce un bloque a código Arduino", async ({ page }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Codigo", exact: true }).click();
  const code = page.locator(".code-content");
  await expect(code).toContainText("void setup()");
  await expect(code).toContainText("void loop()");
});
