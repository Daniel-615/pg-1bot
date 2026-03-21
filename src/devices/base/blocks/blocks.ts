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
      message0: "poner LED en pin %1 a %2",
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
            ["ENCENDIDO", "HIGH"],
            ["APAGADO", "LOW"],
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
      type: "logic_boolean",
      message0: "%1",
      args0: [
        {
          type: "field_dropdown",
          name: "BOOL",
          options: [
            ["true", "TRUE"],
            ["false", "FALSE"],
          ],
        },
      ],
      output: "Boolean",
      colour: "#c54040",
    },
    {
      type: "program_start",
      message0: "🤖 1bot-start %1",
      args0: [
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
      message0: "imprimir %1",
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
      tooltip: "Bloque literal de texto (STRING).",
      helpUrl: "",
    },
  ]);
}
