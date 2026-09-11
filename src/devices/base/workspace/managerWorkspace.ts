import type * as Blockly from "blockly";
import type { SymbolTableRow } from "../../../core/blockEngine/semantic/base/symbolTable";
import { registerBaseBlocks } from "../register";
import { loadDynamicExtensionCategories } from "../../../screens/extensions/dynamicExtensions";

type CreateWorkspaceManagerOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
  editorMode?: "device" | "background";
  installedExtensionIds?: string[];
};

export async function createWorkspaceManager(
  container: HTMLDivElement,
  board: string,
  options: CreateWorkspaceManagerOptions = {}
) : Promise<Blockly.Workspace> {
  registerBaseBlocks();

  if (options.editorMode === "background") {
    const { createBackgroundWorkspace } = await import("../../../backgrounds/workspace");
    return createBackgroundWorkspace(container);
  }

  const extensionCategories = await loadDynamicExtensionCategories(board, options.installedExtensionIds);

  switch (board) {
    case "uno": {
      const [{ createWorkspaceUno }, { ArduinoUnoBoard }] = await Promise.all([
        import("../../arduinoUno/workspace/workspaceUno"),
        import("../../arduinoUno/register"),
      ]);
      new ArduinoUnoBoard().registerBlocks?.();
      return createWorkspaceUno(container, options, extensionCategories);
    }
    case "nano": {
      const [{ createWorkspaceNano }, { ArduinoNanoBoard }] = await Promise.all([
        import("../../arduinoNano/workspace/workspaceNano"),
        import("../../arduinoNano/register"),
      ]);
      new ArduinoNanoBoard().registerBlocks?.();
      return createWorkspaceNano(container, options, extensionCategories);
    }
    case "esp32": {
      const [{ createWorkspaceEsp32 }, { ESP32Board }] = await Promise.all([
        import("../../esp32/workspace/createWorkspaceEsp32"),
        import("../../esp32/register"),
      ]);
      new ESP32Board().registerBlocks?.();
      return createWorkspaceEsp32(container, options, extensionCategories);
    }
    case "mega": {
      const [{ createWorkspaceMega }, { ArduinoMegaBoard }] = await Promise.all([
        import("../../arduinoMega/workspace/workspaceMega"),
        import("../../arduinoMega/register"),
      ]);
      new ArduinoMegaBoard().registerBlocks?.();
      return createWorkspaceMega(container, options, extensionCategories);
    }
    case "codey": {
      const [{ createWorkspaceCodey }, { CodeyBoard }] = await Promise.all([
        import("../../codey/workspace/workspaceCodey"),
        import("../../codey/register"),
      ]);
      new CodeyBoard().registerBlocks?.();
      return createWorkspaceCodey(container, options, extensionCategories);
    }
    default: {
      const { createWorkspace } = await import("../../../core/blockEngine/workspaceManager");
      return createWorkspace(container, extensionCategories, options);
    }
  }
}
