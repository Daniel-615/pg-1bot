import * as Blockly from "blockly";
import { defineArduinoControlBlocks } from "./control/control";
import { defineArdunoOperatorMathematicBlocks } from "./operators/operatorsMathematic";
import { defineArduinoOperatorsLogicBlocks } from "./operators/operatorsLogic";
export function defineArduinoBlocks() {
  defineArduinoControlBlocks();
  defineArdunoOperatorMathematicBlocks();
  defineArduinoOperatorsLogicBlocks();
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
      output: "Number",
      colour: "#c54040",
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
      colour: "#c54040",
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
          variable: "miLista"
        },
        {
          type: "field_dropdown",
          name: "WHERE",
          options: [
            ["%{BKY_1BOT_LIST_FIRST}", "FIRST"],
            ["%{BKY_1BOT_LIST_LAST}", "LAST"],
            ["%{BKY_1BOT_LIST_INDEX}", "FROM_START"],
          ]
        },
        {
          type: "input_value",
          name: "AT",
          check: "Number"
        }
      ],
      output: "Number",
      colour: "#f78c2d",
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
          variable: "miLista"
        },
        {
          type: "field_dropdown",
          name: "WHERE",
          options: [
            ["%{BKY_1BOT_LIST_FIRST}", "FIRST"],
            ["%{BKY_1BOT_LIST_LAST}", "LAST"],
            ["%{BKY_1BOT_LIST_INDEX}", "FROM_START"],
          ]
        },
        {
          type: "input_value",
          name: "AT",
          check: "Number"
        },
        {
          type: "input_value",
          name: "TO"
        }
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#f78c2d",
      tooltip: "Modifica un elemento de una lista guardada en variable.",
      helpUrl: "",
    }
  ]);
}
