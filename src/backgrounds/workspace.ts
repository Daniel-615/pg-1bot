import * as Blockly from "blockly";
import "blockly/blocks";
import { registerBaseBlocks } from "../devices/base/register";
import { getBackgroundCategories } from "./categories";

export function createBackgroundWorkspace(container: HTMLDivElement) {
  registerBaseBlocks();

  const workspace = Blockly.inject(container, {
    toolbox: {
      kind: "categoryToolbox",
      contents: getBackgroundCategories(),
    },
  });

  const startBlock = workspace.newBlock("background_when_run");
  startBlock.initSvg();
  startBlock.render();
  startBlock.moveBy(50, 20);

  return workspace;
}
