import * as Blockly from "blockly";
export function defineArduinoOperatorsLogicBlocks(){
    Blockly.common.defineBlocksWithJsonArray([
        {
            "type": "logic_greater",
            "message0": "%1 > %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": ["Number","String"]
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": ["Number","String"]
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a",
        },
        {
            "type": "logic_less",
            "message0": "%1 < %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": ["Number","String"]
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": ["Number","String"]
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a",
        },
        {
            "type": "logic_equal",
            "message0": "%1 = %2",
            "args0":[
                {
                    "type": "input_value",
                    "name": "A",
                    "check": ["Number","String","Boolean"]
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": ["Number","String","Boolean"]
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a",
        },
        {
            "type": "logic_and",
            "message0": "%{BKY_1BOT_LOGIC_AND}",
            "args0":[
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Boolean"
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Boolean"
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a",
        },
        {
            "type": "logic_or",
            "message0": "%{BKY_1BOT_LOGIC_OR}",
            "args0": [
                {
                "type": "input_value",
                "name": "A",
                "check": "Boolean"
                },
                {
                "type": "input_value",
                "name": "B",
                "check": "Boolean"
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a",
        },
        {
            "type": "logic_not",
            "message0": "%{BKY_1BOT_LOGIC_NOT}",
            "args0": [
                {
                "type": "input_value",
                "name": "BOOL",
                "check": "Boolean"
                }
            ],
            "inputsInline": true,
            "output": "Boolean",
            "colour":"#1a840a"
        },
    ])
}
