import { blocklyText } from "../../../../blockly/messages";
export function getControlCategories() {
return [
  {
    kind: "category",
    name: blocklyText("1BOT_CAT_CONTROL"),
    colour: "#ffaa00",
    contents: [
        { 
            kind: "block",
            type: "if" 
        },
        { 
            kind: "block", 
            type: "if_else" 
        },
        { 
            kind: "block", 
            type: "while_repeat" 
        },
        { 
            kind: "block", 
            type: "do_while" 
        },
        { 
            kind: "block",
            type: "for_range" 
        },
        { 
            kind: "block", 
            type: "break" 
        },
        { 
            kind: "block", 
            type: "continue" 
        },
        { 
            kind: "block", 
            type: "delay_ms" 
        },
        { 
            kind: "block", 
            type: "repeat_until" 
        },
    ],
  },
];
}
