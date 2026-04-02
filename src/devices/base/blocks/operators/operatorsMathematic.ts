import * as Blockly from "blockly";
export function defineArdunoOperatorMathematicBlocks(){
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
            "type": "math_random",
            "message0": "%{BKY_1BOT_MATH_RANDOM}",
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
