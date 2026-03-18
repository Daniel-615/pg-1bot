import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { esp32WifiCategories } from "./esp32WifiCategories";

type WorkspaceOptions = {
    onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceEsp32(container:HTMLDivElement, options: WorkspaceOptions = {}){
    return createWorkspace(container,esp32WifiCategories, options)
}
