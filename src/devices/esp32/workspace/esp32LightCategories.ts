import { blocklyText } from "../../../blockly/messages";
export function getEsp32LightCategories() {
return [
  {
    kind: "category",
    name: blocklyText("1BOT_CAT_ESP32_LIGHTS"),
    colour: "#1f7aec",
    contents: [
      {
        kind: "block",
        type: "esp32_neopixel_init",
      },
      {
        kind: "block",
        type: "esp32_neopixel_color",
      },
      {
        kind: "block",
        type: "esp32_neopixel_set_color",
      },
      {
        kind: "block",
        type: "esp32_neopixel_set_rgb",
      },
      {
        kind: "block",
        type: "esp32_neopixel_clear",
      },
    ],
  },
];
}
