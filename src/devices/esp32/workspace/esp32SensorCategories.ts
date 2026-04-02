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
      {
        kind: "block",
        type: "esp32_dht_init",
      },
      {
        kind: "block",
        type: "esp32_dht_temperature",
      },
      {
        kind: "block",
        type: "esp32_dht_humidity",
      },
      {
        kind: "block",
        type: "esp32_servo_attach",
      },
      {
        kind: "block",
        type: "esp32_servo_write",
      },
      {
        kind: "block",
        type: "esp32_tone_play",
      },
      {
        kind: "block",
        type: "esp32_tone_stop",
      },
    ],
  },
];
}
