import { blocklyText } from "../../../../blockly/messages";
export function getHardwareCategories() {
return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_HARDWARE"),
      colour: "#FF6680",
      contents: [
        { 
            kind: "block",
            type: "led_set" 
        },
        { 
            kind: "block", 
            type: "print" 
        },
      ],
    },
];
}
