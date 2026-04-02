import * as Blockly from "blockly";

export function defineEsp32SensorBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "esp32_touch_read",
      message0: "%{BKY_1BOT_ESP32_SENSOR_TOUCH}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 13,
          min: 0,
          max: 39,
        },
      ],
      output: "Number",
      colour: "#f39c12",
      tooltip: "Lee el valor capacitivo touch del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_ultrasonic_distance",
      message0: "%{BKY_1BOT_ESP32_SENSOR_ULTRASONIC}",
      args0: [
        {
          type: "field_number",
          name: "TRIG",
          value: 2,
          min: 0,
          max: 39,
        },
        {
          type: "field_number",
          name: "ECHO",
          value: 5,
          min: 0,
          max: 39,
        },
      ],
      output: "Number",
      colour: "#f39c12",
      tooltip: "Devuelve la distancia medida por un sensor ultrasonico",
      helpUrl: "",
    },
  ]);
}
