import * as Blockly from "blockly";
import { defineArduinoControlBlocks } from "./control/control";
import { defineArdunoOperatorMathematicBlocks } from "./operators/operatorsMathematic";
import { defineArduinoOperatorsLogicBlocks } from "./operators/operatorsLogic";

type JsonObjectBlock = Blockly.BlockSvg & {
  itemCount_: number;
  updateShape_: () => void;
};

type JsonMutatorItemBlock = Blockly.BlockSvg & {
  valueConnection_?: Blockly.Connection | null;
};

const VARIABLE_COLOR = "#fb8e3b";
const TYPE_COLOR = "#c54040";

function wrapBlockInitColor(blockType: string, colour: string) {
  const blockDefinition = Blockly.Blocks[blockType];

  if (!blockDefinition?.init || (blockDefinition as { __1botColorWrapped?: boolean }).__1botColorWrapped) {
    return;
  }

  const originalInit = blockDefinition.init;
  blockDefinition.init = function wrappedInit(this: Blockly.Block) {
    originalInit.call(this);
    this.setColour(colour);
  };
  (blockDefinition as { __1botColorWrapped?: boolean }).__1botColorWrapped = true;
}

function defineVariableBlocks() {
  wrapBlockInitColor("lists_create_with", VARIABLE_COLOR);
  wrapBlockInitColor("lists_length", VARIABLE_COLOR);
}

function defineTypeBlocks() {
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "logic_boolean",
      message0: "%1",
      args0: [
        {
          type: "field_dropdown",
          name: "BOOL",
          options: [
            ["verdadero", "TRUE"],
            ["falso", "FALSE"],
          ],
        },
      ],
      output: "Boolean",
      colour: TYPE_COLOR,
    },
  ]);
}

function defineJsonBlocks() {
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "json_object_mutator_container",
      message0: "%{BKY_1BOT_BLOCK_JSON_MUTATOR_CONTAINER} %1",
      args0: [
        {
          type: "input_statement",
          name: "STACK",
        },
      ],
      colour: "#c54040",
      tooltip: "",
      enableContextMenu: false,
    },
    {
      type: "json_object_mutator_item",
      message0: "%{BKY_1BOT_BLOCK_JSON_MUTATOR_ITEM}",
      previousStatement: null,
      nextStatement: null,
      colour: "#c54040",
      tooltip: "",
      enableContextMenu: false,
    },
  ]);

  Blockly.Blocks["json_object"] = {
    init(this: JsonObjectBlock) {
      this.itemCount_ = 1;
      this.setOutput(true, "String");
      this.setColour("#c54040");
      this.setTooltip("%{BKY_1BOT_BLOCK_JSON_OBJECT_TOOLTIP}");
      this.setHelpUrl("");
      this.setMutator(new Blockly.icons.MutatorIcon(["json_object_mutator_item"], this));
      this.updateShape_();
    },
    saveExtraState(this: JsonObjectBlock) {
      return {
        itemCount: this.itemCount_,
      };
    },
    loadExtraState(this: JsonObjectBlock, state: { itemCount?: number }) {
      this.itemCount_ = Math.max(state.itemCount ?? 1, 1);
      this.updateShape_();
    },
    decompose(this: JsonObjectBlock, workspace: Blockly.Workspace) {
      const containerBlock = workspace.newBlock("json_object_mutator_container") as Blockly.BlockSvg;
      containerBlock.initSvg();

      let connection = containerBlock.getInput("STACK")?.connection ?? null;
      for (let index = 0; index < this.itemCount_; index += 1) {
        const itemBlock = workspace.newBlock("json_object_mutator_item") as JsonMutatorItemBlock;
        itemBlock.initSvg();
        if (connection && itemBlock.previousConnection) {
          connection.connect(itemBlock.previousConnection);
        }
        connection = itemBlock.nextConnection;
      }

      return containerBlock;
    },
    compose(this: JsonObjectBlock, containerBlock: Blockly.Block) {
      let itemBlock = containerBlock.getInputTargetBlock("STACK") as JsonMutatorItemBlock | null;
      const connections: Array<Blockly.Connection | null> = [];

      while (itemBlock) {
        if (!itemBlock.isInsertionMarker()) {
          connections.push(itemBlock.valueConnection_ ?? null);
        }
        itemBlock = itemBlock.getNextBlock() as JsonMutatorItemBlock | null;
      }

      for (let index = 0; index < this.itemCount_; index += 1) {
        const connection = this.getInput(`VALUE${index}`)?.connection?.targetConnection;
        if (connection && !connections.includes(connection)) {
          connection.disconnect();
        }
      }

      this.itemCount_ = Math.max(connections.length, 1);
      this.updateShape_();

      for (let index = 0; index < this.itemCount_; index += 1) {
        connections[index]?.reconnect(this, `VALUE${index}`);
      }
    },
    saveConnections(this: JsonObjectBlock, containerBlock: Blockly.Block) {
      let itemBlock = containerBlock.getInputTargetBlock("STACK") as JsonMutatorItemBlock | null;
      let index = 0;

      while (itemBlock) {
        if (!itemBlock.isInsertionMarker()) {
          itemBlock.valueConnection_ =
            this.getInput(`VALUE${index}`)?.connection?.targetConnection ?? null;
          index += 1;
        }
        itemBlock = itemBlock.getNextBlock() as JsonMutatorItemBlock | null;
      }
    },
    updateShape_(this: JsonObjectBlock) {
      if (this.getInput("TITLE")) {
        this.removeInput("TITLE");
      }
      this.appendDummyInput("TITLE")
        .appendField(Blockly.Msg["1BOT_BLOCK_JSON_OBJECT"] || "crear JSON");

      let index = 0;
      while (this.getInput(`VALUE${index}`)) {
        this.removeInput(`VALUE${index}`);
        index += 1;
      }

      if (this.getInput("JSON_END")) {
        this.removeInput("JSON_END");
      }

      for (let pairIndex = 0; pairIndex < this.itemCount_; pairIndex += 1) {
        this.appendValueInput(`VALUE${pairIndex}`)
          .appendField(pairIndex === 0 ? "{" : ",")
          .appendField(Blockly.Msg["1BOT_BLOCK_JSON_FIELD"] || "campo")
          .appendField(new Blockly.FieldTextInput(`campo${pairIndex + 1}`), `KEY${pairIndex}`)
          .appendField(Blockly.Msg["1BOT_BLOCK_JSON_VALUE"] || "valor");
      }

      this.appendDummyInput("JSON_END").appendField("}");
    },
  };
}

export function defineArduinoBlocks() {
  defineArduinoControlBlocks();
  defineArdunoOperatorMathematicBlocks();
  defineArduinoOperatorsLogicBlocks();
  defineVariableBlocks();
  defineTypeBlocks();
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "led_set",
      message0: "%{BKY_1BOT_BLOCK_LED_SET}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 13,
          min: 0,
          max: 13,
        },
        {
          type: "field_dropdown",
          name: "STATE",
          options: [
            ["%{BKY_1BOT_LED_ON}", "HIGH"],
            ["%{BKY_1BOT_LED_OFF}", "LOW"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: "",
      helpUrl: "",
    },
    {
      type: "program_start",
      message0: "%1 %{BKY_1BOT_BLOCK_PROGRAM_START} %2",
      args0: [
        {
          type: "field_image",
          src: "logo.webp",
          width: 28,
          height: 28,
          alt: "1bot",
        },
        {
          type: "input_statement",
          name: "DO",
        },
      ],
      colour: "#7fe1f5",
      tooltip: "Bloque principal por donde comienza el programa",
      helpUrl: "",
    },
    {
      type: "print",
      message0: "%{BKY_1BOT_BLOCK_PRINT}",
      args0: [
        {
          type: "input_value",
          name: "TEXT",
          check: ["String", "Number", "Boolean"],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: "Imprime un valor por Serial",
      helpUrl: "",
    },
    {
      type: "number",
      message0: "%1",
      args0: [
        {
          type: "field_number",
          name: "NUM",
          value: 0,
        },
      ],
      output: null,
      colour: TYPE_COLOR,
    },
    {
      type: "string",
      message0: "'%1'",
      args0: [
        {
          type: "field_input",
          name: "STRING",
          text: "Hola",
        },
      ],
      output: "String",
      colour: TYPE_COLOR,
      tooltip: "%{BKY_1BOT_BLOCK_STRING_TOOLTIP}",
      helpUrl: "",
    },
    {
      type: "list_var_get_index",
      message0: "%{BKY_1BOT_BLOCK_LIST_GET_INDEX}",
      args0: [
        {
          type: "field_variable",
          name: "VAR",
          variable: "miLista",
        },
        {
          type: "field_dropdown",
          name: "WHERE",
          options: [
            ["%{BKY_1BOT_LIST_FIRST}", "FIRST"],
            ["%{BKY_1BOT_LIST_LAST}", "LAST"],
            ["%{BKY_1BOT_LIST_INDEX}", "FROM_START"],
          ],
        },
        {
          type: "input_value",
          name: "AT",
          check: "Number",
        },
      ],
      output: "Number",
      colour: VARIABLE_COLOR,
      tooltip: "Obtiene un elemento de una lista guardada en variable.",
      helpUrl: "",
    },
    {
      type: "list_var_set_index",
      message0: "%{BKY_1BOT_BLOCK_LIST_SET_INDEX}",
      args0: [
        {
          type: "field_variable",
          name: "VAR",
          variable: "miLista",
        },
        {
          type: "field_dropdown",
          name: "WHERE",
          options: [
            ["%{BKY_1BOT_LIST_FIRST}", "FIRST"],
            ["%{BKY_1BOT_LIST_LAST}", "LAST"],
            ["%{BKY_1BOT_LIST_INDEX}", "FROM_START"],
          ],
        },
        {
          type: "input_value",
          name: "AT",
          check: "Number",
        },
        {
          type: "input_value",
          name: "TO",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: VARIABLE_COLOR,
      tooltip: "Modifica un elemento de una lista guardada en variable.",
      helpUrl: "",
    },
  ]);
  defineJsonBlocks();
}
