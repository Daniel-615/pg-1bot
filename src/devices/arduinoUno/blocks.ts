import * as Blockly from "blockly";

export function defineArduinoBlocks() {

    Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "arduino_setup",
      "message0": "cuando inicia",
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "SETUP_BODY"
        }
      ],
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    },

    {
      "type": "arduino_loop",
      "message0": "por siempre",
      "message1": "%1",
      "args1": [
        {
          "type": "input_statement",
          "name": "LOOP_BODY"
        }
      ],
      "colour": 230,
      "tooltip": "",
      "helpUrl": ""
    },
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
        "type": "delay_ms",
        "message0": "esperar %1 ms",
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
        "colour": 60,
        "tooltip": "",
        "helpUrl": ""
    },
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
      "colour": 210,
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
      "colour": 210,
      "inputsInline": false
    },
    {
      "type": "while",
      "message0": "mientras %1",
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
      "colour": 120,
      "inputsInline": false
    }
  ]);

}