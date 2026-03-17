import * as Blockly from "blockly";
export function defineArduinoControlBlocks(){
    Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "if",
      "message0": "si %1",
      "args0":[
        {
          "type": "input_value", 
          "name": "CONDITION", 
          "check": "Boolean"
        }
      ],
      "message1": "%1",
      "args1":[
        {
          "type": "input_statement",
          "name": "IF_BODY"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
      "inputsInline": false
    },
    {
      "type": "if_else",
      "message0": "si %1 entonces",
      "args0": [
        { 
          "type": "input_value", 
          "name": "CONDITION", 
          "check": "Boolean" 
        }
      ],
      "message1": "%1",
      "args1": [
        { "type": "input_statement", "name": "IF_BODY" }
      ],
      "message2": "sino %1",
      "args2": [
        { "type": "input_statement", "name": "ELSE_BODY" }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
      "inputsInline": false
    },
    {
      "type": "do_while",
      "message0": "hacer %1",
      "args0":[
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "message1": "mientras %1",
      "args1":[
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
      "inputsInline": false
    },
    {
      "type": "while_repeat",
      "message0": "mientras se repite %1",
      "args0":[
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "message1": "hacer %1",
      "args1":[
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
      "inputsInline": false
    },
    {
      "type": "repeat_until",
      "message0": "repite hasta que %1",
      "args0": [
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "BOOLEAN",

        }
      ],
      "message1": "%1",
      "args1":[
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
    },

    {
      "type": "for_range",
      "message0": "contar con %1 de %2 a %3 por paso %4",
      "args0":[
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": "i"
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        },
        {
          "type": "field_number",
          "name": "STEP",
          "value": 1,
          "min": 1
        }
      ],
      "message1": "hacer %1",
      "args1":[
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": "#ffaa00",
      "inputsInline": false
    },
     {
      "type": "break",
      "message0": "romper",
      "previousStatement":null,
      "nextStatement":null,
      "colour": "#ffaa00",
    },
    {
      "type": "continue",
      "message0": "continuar",
      "previousStatement":null,
      "nextStatement": null,
      "colour": "#ffaa00",
    },
    {
        "type": "delay_ms",
        "message0": "esperar %1 milisegundos",
        "args0":[
            {
                "type": "field_number",
                "name": "TIME",
                "value": 1000,
                "min":0
            }
        ],
        "previousStatement": null,
        "nextStatement": null,
        "colour": "#ffaa00",
        "tooltip": "",
        "helpUrl": ""
    },
  ])
}