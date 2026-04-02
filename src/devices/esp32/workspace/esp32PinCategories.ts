import { blocklyText } from "../../../blockly/messages";
export function getEsp32PinCategories() {
return [
  {
    kind: "category",
    name: blocklyText("1BOT_CAT_ESP32_PINS"),
    colour: "#8e44ad",
    contents: [
      {
        kind: "block",
        type: "esp32_digital_write",
      },
      {
        kind: "block",
        type: "esp32_digital_read",
      },
      {
        kind: "block",
        type: "esp32_analog_read",
      },
      {
        kind: "block",
        type: "esp32_pwm_write",
      },
    ],
  },
];
}
