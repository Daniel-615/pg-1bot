import * as Blockly from "blockly";
import { createWorkspaceEsp32 } from "../../esp32/workspace/createWorkspaceEsp32";
import { createWorkspaceUno } from "../../arduinoUno/workspace/workspaceUno";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";

type CreateWorkspaceManagerOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceManager(
  container: HTMLDivElement,
  board: string,
  options: CreateWorkspaceManagerOptions = {}
): Blockly.Workspace {
  switch (board) {
    case "uno":
      return createWorkspaceUno(container, options);
    case "esp32":
      return createWorkspaceEsp32(container, options);
    default:
      return createWorkspace(container, [], options);
  }
}
