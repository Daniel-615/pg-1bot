import { blocklyText } from "../../../blockly/messages";
export function getEsp32SensorCategories() {
return [
  {
    kind: "category",
    name: blocklyText("1BOT_CAT_ESP32_SENSORS"),
    colour: "#f39c12",
    contents: [
      {
        kind: "block",
        type: "esp32_touch_read",
      },
      {
        kind: "block",
        type: "esp32_ultrasonic_distance",
      },
    ],
  },
];
}
