import { expect, test } from "@playwright/test";
import { openEditor } from "../helpers/e2e";

test("TC-AUTO-004: arrastra un bloque lógico al espacio de trabajo", async ({ page }) => {
  await openEditor(page);
  const workspace = page.getByRole("region", { name: "Blocks workspace." });
  const workspaceBlocks = page.getByRole("figure");
  const initialBlocks = await workspaceBlocks.count();
  await page.getByText("PINES ESP32", { exact: true }).click({ force: true });
  const flyoutBlock = page.locator(".blocklyFlyout .blocklyDraggable").first();
  await flyoutBlock.waitFor({ state: "visible" });
  const source = await flyoutBlock.boundingBox();
  const target = await workspace.boundingBox();
  expect(source).not.toBeNull();
  expect(target).not.toBeNull();
  await page.mouse.move(source!.x + source!.width / 2, source!.y + source!.height / 2);
  await page.mouse.down();
  await page.mouse.move(target!.x + target!.width * 0.75, target!.y + target!.height * 0.5, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => workspaceBlocks.count()).toBeGreaterThan(initialBlocks);
});
