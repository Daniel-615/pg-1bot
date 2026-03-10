import * as Blockly from "blockly";

export function defineArduinoOperatorsBlocks(){
    Blockly.common.defineBlocksWithJsonArray([
        {
            "type": "math_add",
            "message0": "%1 + %2",
            "args0":[
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour":"#1a840a",
        },
        {
            "type": "math_subtract",
            "message0": "%1 - %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour":"#1a840a",
        },
        {
            "type": "math_multiply",
            "message0": "%1 * %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour":"#1a840a",
        },
        {
            "type": "math_divide",
            "message0": "%1 / %2",
            "args0": [
                {
                    "type": "input_value",
                    "name": "A",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "B",
                    "check": "Number"
                }
            ],
            "inputsInline": true,
            "output": "Number",
            "colour":"#1a840a",
        },
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
            "message0": "%1 y %2",
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
            "message0": "%1 o %2",
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
            "message0": "no %1",
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
        {
            "type": "math_random",
            "message0": "número al azar entre %1 y %2",
            "args0":[
                {
                    "type": "input_value",
                    "name": "MIN",
                    "check": "Number"
                },
                {
                    "type": "input_value",
                    "name": "MAX",
                    "check": "Number"
                }                
            ],
            "inputsInline":true,
            "output": "Number",
            "colour":"#1a840a"
        }
    ])
}