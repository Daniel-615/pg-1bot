import * as Blockly from "blockly";
import { createWorkspaceEsp32 } from "../esp32/workspace/createWorkspaceEsp32";
import { createWorkspaceUno } from "../arduinoUno/workspace/workspaceUno";
import { createWorkspace } from "../../core/blockEngine/workspaceManager";
export function createWorkspaceManager(
  container: HTMLDivElement,
  board: string
): Blockly.Workspace {
  switch (board) {
    case "uno":
      return createWorkspaceUno(container);
    case "esp32":
      return createWorkspaceEsp32(container);
    default:
      return createWorkspace(container);
  }
}