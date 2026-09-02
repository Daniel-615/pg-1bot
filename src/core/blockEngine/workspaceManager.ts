import * as Blockly from "blockly";
import "blockly/blocks";
import { ArduinoSemanticAnalyzer } from "./semantic/arduinoSemanticAnalyzer";
import type { SymbolTableRow } from "./semantic/base/symbolTable";
import { getBaseCategories } from "../../devices/base/workspace/baseCategories";
import type { BlocklyWorkspaceWithAnalyzer } from "../../screens/types";
type CreateWorkspaceOptions = {
  onSymbolTableChange?: (rows: SymbolTableRow[]) => void;
  onSemanticErrorsChange?: (
    errors: ReturnType<ArduinoSemanticAnalyzer["getErrors"]>
  ) => void;
};

export function createWorkspace(
  container: HTMLDivElement,
  extraCategories: Blockly.utils.toolbox.ToolboxItemInfo[] = [],
  options: CreateWorkspaceOptions = {}
) {
  const analyzer = new ArduinoSemanticAnalyzer();
  const workspace = Blockly.inject(container, {
    toolbox: {
      kind: "categoryToolbox",
      contents: [
        ...getBaseCategories(),
        ...extraCategories
      ],
    },
  }) as unknown as BlocklyWorkspaceWithAnalyzer;
  workspace.registerToolboxCategoryCallback("VARIABLE_EXTENDED", (targetWorkspace) => {
    const variableItems = Blockly.Variables.flyoutCategory(targetWorkspace) as Blockly.utils.toolbox.FlyoutItemInfoArray;

    return [
      ...variableItems, //it returns the object with the list of blocks defined on each electronic board
      { kind: "sep" },
      { kind: "block", type: "lists_create_with" },
      { kind: "block", type: "lists_length" },
      { kind: "block", type: "list_var_get_index" },
      { kind: "block", type: "list_var_set_index" },
    ] as Blockly.utils.toolbox.FlyoutItemInfoArray;
  });
  const startBlock = workspace.newBlock("program_start");
  startBlock.initSvg();
  startBlock.render();
  startBlock.moveBy(50, 20);
  startBlock.setDeletable(false);
  startBlock.setMovable(false);
  analyzer.analyze(workspace);
  options.onSymbolTableChange?.(analyzer.getSymbolTableRows());
  options.onSemanticErrorsChange?.(analyzer.getErrors());
  workspace.semanticAnalyzer = analyzer;
  workspace.addChangeListener((event) => {
    /* 
      Execute the semantic analyze on four actions, create, delete, change or move a block, detecting errors in real time
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
        options.onSymbolTableChange?.(analyzer.getSymbolTableRows()); // renderize the symbol table displayed on the screen
        options.onSemanticErrorsChange?.(
          analyzer.getErrors()
        )
      }, 0);
    }
  });
  return workspace;
}
