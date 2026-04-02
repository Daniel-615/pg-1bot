import * as Blockly from "blockly";
export function defineArduinoControlBlocks(){
    Blockly.common.defineBlocksWithJsonArray([
    {
      "type": "if",
      "message0": "%{BKY_1BOT_CONTROL_IF}",
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
      "message0": "%{BKY_1BOT_CONTROL_IF_THEN}",
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
      "message2": "%{BKY_1BOT_CONTROL_ELSE}",
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
      "message0": "%{BKY_1BOT_CONTROL_DO}",
      "args0":[
        {
          "type": "input_statement",
          "name": "BODY"
        }
      ],
      "message1": "%{BKY_1BOT_CONTROL_WHILE}",
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
      "message0": "%{BKY_1BOT_CONTROL_WHILE_REPEAT}",
      "args0":[
        {
          "type": "input_value",
          "name": "CONDITION",
          "check": "Boolean"
        }
      ],
      "message1": "%{BKY_1BOT_CONTROL_DO}",
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
      "message0": "%{BKY_1BOT_CONTROL_REPEAT_UNTIL}",
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
      "message0": "%{BKY_1BOT_CONTROL_FOR_RANGE}",
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
      "message1": "%{BKY_1BOT_CONTROL_DO}",
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
      "message0": "%{BKY_1BOT_CONTROL_BREAK}",
      "previousStatement":null,
      "nextStatement":null,
      "colour": "#ffaa00",
    },
    {
      "type": "continue",
      "message0": "%{BKY_1BOT_CONTROL_CONTINUE}",
      "previousStatement":null,
      "nextStatement": null,
      "colour": "#ffaa00",
    },
    {
        "type": "delay_ms",
        "message0": "%{BKY_1BOT_CONTROL_DELAY}",
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
