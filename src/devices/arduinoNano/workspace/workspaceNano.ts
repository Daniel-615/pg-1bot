import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getArduinoUnoCategories } from "../../arduinoUno/workspace/unoCategories";
import { getArduinoNanoCategories } from "./nanoCategories";

type WorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceNano(container: HTMLDivElement, options: WorkspaceOptions = {}) {
  return createWorkspace(
    container,
    getArduinoUnoCategories(getArduinoNanoCategories()),
    options
  );
}
