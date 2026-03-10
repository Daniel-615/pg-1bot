import * as Blockly from "blockly";
import { defineArduinoControlBlocks } from "./control/control";
import { defineArduinoOperatorsBlocks } from "./operators/operators";
export function defineArduinoBlocks() {
    defineArduinoControlBlocks();
    defineArduinoOperatorsBlocks();
    Blockly.common.defineBlocksWithJsonArray([
    {
        "type": "led_set",
        "message0": "poner LED en pin %1 a %2",
        "args0":[
            {
                "type": "field_number",
                "name":"PIN",
                "value":13,
                "min":0,
                "max":13
            },
            {
                "type": "field_dropdown",
                "name":"STATE",
                "options":[
                    ["ENCENDIDO","HIGH"],
                    ["APAGADO","LOW"]
                ]
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "",
        "helpUrl": ""
    },
    {
      "type": "print",
      "message0": "imprimir %1",
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT",
          "check": "String"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": 160,
      "tooltip": "Imprime un string por Serial",
      "helpUrl": ""
    },
    {
      "type": "number",
      "message0": "%1",
      "args0":[
        {
          "type":"field_number",
          "name":"NUM",
          "value":0
        }
      ],
      "output": "Number",
      "colour": 230
    },
    {
      "type": "string",
      "message0": "'%1'",
      "args0": [
        {
          "type": "field_input",
          "name": "STRING",
          "text": "Hola"
        }
      ],
      "output": "String",
      "colour": 230,
      "tooltip": "Bloque literal de texto (STRING).",
      "helpUrl": ""
    }
  ]);
}