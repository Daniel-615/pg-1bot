import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/base/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getCodeyCategories } from "./codeyCategories";
type WorkspaceOptions={
    onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
}
export function createWorkspaceCodey(
    container: HTMLDivElement,
    options: WorkspaceOptions = {},
    extraCategories: Blockly.utils.toolbox.ToolboxItemInfo[] = []
){
    return createWorkspace(container, getCodeyCategories(extraCategories), options);
}
