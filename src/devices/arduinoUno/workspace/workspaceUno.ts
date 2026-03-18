import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { unoCategories } from "./unoCategories";

type WorkspaceOptions = {
    onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceUno(container: HTMLDivElement, options: WorkspaceOptions = {}){
    return createWorkspace(container,unoCategories, options);
}
