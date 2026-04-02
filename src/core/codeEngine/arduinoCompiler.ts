import type * as Blockly from "blockly";
import { BoardFactory } from "../../boards/BoardFactory";

export async function compileArduino(
  workspace: Blockly.Workspace,
  boardType: string
) {
  const board = await BoardFactory.create(boardType);
  const generator = board.getGenerator();

  generator.init(workspace);

  const code = generator.workspaceToCode(workspace);

  return code;
}
