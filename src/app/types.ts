import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../core/blockEngine/semantic/base/symbolTable";
import type { Language } from "../i18n";

export type EditorRuntime = {
  applyBlocklyLocale: (language?: Language) => void;
  compileArduino: (
    workspace: Blockly.Workspace,
    boardType: string
  ) => Promise<string>;
  createWorkspaceManager: (
    container: HTMLDivElement,
    board: string,
    options?: {
      onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
    }
  ) => Promise<Blockly.Workspace>;
};

export type DeviceOption = {
  id: string;
  name: string;
  img: string;
};
