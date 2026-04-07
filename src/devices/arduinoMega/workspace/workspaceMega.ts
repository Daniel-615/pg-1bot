import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { createWorkspace } from "../../../core/blockEngine/workspaceManager";
import { getArduinoUnoCategories } from "../../arduinoUno/workspace/unoCategories";
import { getArduinoMegaCategories } from "./megaCategories";

type WorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspaceMega(container: HTMLDivElement, options: WorkspaceOptions = {}) {
  return createWorkspace(
    container,
    getArduinoUnoCategories(getArduinoMegaCategories()),
    options
  );
}
