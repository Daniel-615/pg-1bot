import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/base/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getEsp32Categories } from "./esp32Categories";

type WorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceEsp32(
  container: HTMLDivElement,
  options: WorkspaceOptions = {},
  extraCategories: Blockly.utils.toolbox.ToolboxItemInfo[] = []
) {
  return createWorkspace(container, getEsp32Categories(extraCategories), options);
}
