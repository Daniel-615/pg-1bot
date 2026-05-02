import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../core/blockEngine/semantic/base/symbolTable";
import type { Language } from "../i18n";
import type { CompileResult } from "../core/codeEngine/arduinoCompiler";

export type EditorRuntime = {
  applyBlocklyLocale: (language?: Language) => void;
  compileArduino: (
    workspace: Blockly.Workspace,
    boardType: string
  ) => Promise<CompileResult>;
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

export type SerialPortOption = {
  path: string;
  friendlyName?: string;
};

export type SimulationBlock = {
  id: string;
  type: string;
  fields: Record<string, string>;
  inputs: Record<string, SimulationBlock | null>;
  next: SimulationBlock | null;
};
