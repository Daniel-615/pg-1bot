import { expect, test } from "@playwright/test";
import { openEditor } from "../helpers/e2e";

test("TC-AUTO-009: descarga el código fuente como .ino", async ({ page }) => {
  await openEditor(page);
  await page.getByRole("button", { name: "Codigo", exact: true }).click();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar .ino" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/\.ino$/i);
});
