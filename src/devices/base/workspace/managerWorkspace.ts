import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/symbolTable";
import { registerBaseBlocks } from "../register";

type CreateWorkspaceManagerOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export async function createWorkspaceManager(
  container: HTMLDivElement,
  board: string,
  options: CreateWorkspaceManagerOptions = {}
) : Promise<Blockly.Workspace> {
  registerBaseBlocks();

  switch (board) {
    case "uno": {
      const [{ createWorkspaceUno }, { ArduinoUnoBoard }] = await Promise.all([
        import("../../arduinoUno/workspace/workspaceUno"),
        import("../../arduinoUno/register"),
      ]);
      new ArduinoUnoBoard().registerBlocks?.();
      return createWorkspaceUno(container, options);
    }
    case "nano": {
      const [{ createWorkspaceNano }, { ArduinoNanoBoard }] = await Promise.all([
        import("../../arduinoNano/workspace/workspaceNano"),
        import("../../arduinoNano/register"),
      ]);
      new ArduinoNanoBoard().registerBlocks?.();
      return createWorkspaceNano(container, options);
    }
    case "esp32": {
      const [{ createWorkspaceEsp32 }, { ESP32Board }] = await Promise.all([
        import("../../esp32/workspace/createWorkspaceEsp32"),
        import("../../esp32/register"),
      ]);
      new ESP32Board().registerBlocks?.();
      return createWorkspaceEsp32(container, options);
    }
    case "mega": {
      const [{ createWorkspaceMega }, { ArduinoMegaBoard }] = await Promise.all([
        import("../../arduinoMega/workspace/workspaceMega"),
        import("../../arduinoMega/register"),
      ]);
      new ArduinoMegaBoard().registerBlocks?.();
      return createWorkspaceMega(container, options);
    }
    default: {
      const { createWorkspace } = await import("../../../core/blockEngine/workspaceManager");
      return createWorkspace(container, [], options);
    }
  }
}
