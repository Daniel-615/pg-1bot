import * as Blockly from "blockly";
import { BoardFactory } from "../../boards/BoardFactory";

export function compileArduino(
  workspace: Blockly.Workspace,
  boardType: string
) {
  const board = BoardFactory.create(boardType);
  const generator = board.getGenerator();

  generator.init(workspace);

  const code = generator.workspaceToCode(workspace);

  return code;
} 