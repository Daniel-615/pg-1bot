import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/base/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getArduinoUnoCategories } from "../../arduinoUno/workspace/unoCategories";
import { getArduinoNanoCategories } from "./nanoCategories";

type WorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceNano(
  container: HTMLDivElement,
  options: WorkspaceOptions = {},
  extraCategories: Blockly.utils.toolbox.ToolboxItemInfo[] = []
) {
  return createWorkspace(
    container,
    getArduinoUnoCategories([...getArduinoNanoCategories(), ...extraCategories]),
    options
  );
}
