import * as Blockly from "blockly";
import "blockly/blocks";
import { ArduinoSemanticAnalyzer } from "./semantic/arduinoSemanticAnalyzer";
import type { SymbolTableRow } from "./semantic/symbolTable";
import { getBaseCategories } from "../../devices/base/workspace/baseCategories";

type CreateWorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
};

export function createWorkspace(
  container: HTMLDivElement,
  extraCategories: any[] = [],
  options: CreateWorkspaceOptions = {}
) {
  //importar el analizador de errores
  const analyzer = new ArduinoSemanticAnalyzer();
  const workspace = Blockly.inject(container, {
    toolbox: {
      kind: "categoryToolbox",
      contents: [
        ...getBaseCategories(),
        ...extraCategories
      ],
    },
  });
  const startBlock = workspace.newBlock("program_start");
  startBlock.initSvg();
  startBlock.render();
  startBlock.moveBy(50, 20);
  startBlock.setDeletable(false);
  startBlock.setMovable(false);
  analyzer.analyze(workspace);
  options.onSymbolTableChange?.(analyzer.getSymbolTableRows());
  workspace.addChangeListener((event) => {
    /* 
      Se ejecuta el análisis semántico cada vez que se crea, borra,
      cambia o mueve un bloque, para detectar errores en tiempo real.
    */
    if (event.isUiEvent) return;
    if (
      event.type === Blockly.Events.BLOCK_CREATE ||
      event.type === Blockly.Events.BLOCK_DELETE ||
      event.type === Blockly.Events.BLOCK_CHANGE ||
      event.type === Blockly.Events.BLOCK_MOVE
    ) {
      setTimeout(() => {
        analyzer.analyze(workspace);
        options.onSymbolTableChange?.(analyzer.getSymbolTableRows());
        //analyzer.startDebug(workspace);
        //analyzer.step(workspace)
      }, 0);
    }
  });
  return workspace;
}
