import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getEsp32Categories } from "./esp32Categories";

type WorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceEsp32(container: HTMLDivElement, options: WorkspaceOptions = {}) {
  return createWorkspace(container, getEsp32Categories(), options);
}
