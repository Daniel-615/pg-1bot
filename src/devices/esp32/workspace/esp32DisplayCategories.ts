import { blocklyText } from "../../../blockly/messages";
export function getEsp32DisplayCategories() {
return [
  {
    kind: "category",
    name: blocklyText("1BOT_CAT_DISPLAY"),
    colour: "#16a085",
    contents: [
      {
        kind: "block",
        type: "esp32_display_init",
      },
      {
        kind: "block",
        type: "esp32_display_print",
      },
      {
        kind: "block",
        type: "esp32_display_clear",
      },
    ],
  },
];
}
