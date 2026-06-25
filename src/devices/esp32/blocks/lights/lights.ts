import * as Blockly from "blockly";

const ESP32_OUTPUT_PIN_OPTIONS = [
  ["GPIO 2", "2"],
  ["GPIO 4", "4"],
  ["GPIO 5", "5"],
  ["GPIO 12", "12"],
  ["GPIO 13", "13"],
  ["GPIO 14", "14"],
  ["GPIO 15", "15"],
  ["GPIO 16", "16"],
  ["GPIO 17", "17"],
  ["GPIO 18", "18"],
  ["GPIO 19", "19"],
  ["GPIO 21", "21"],
  ["GPIO 22", "22"],
  ["GPIO 23", "23"],
  ["GPIO 25", "25"],
  ["GPIO 26", "26"],
  ["GPIO 27", "27"],
  ["GPIO 32", "32"],
  ["GPIO 33", "33"],
] as const;

export function defineEsp32LightBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "esp32_neopixel_init",
      message0: "%{BKY_1BOT_ESP32_LIGHT_INIT}",
      args0: [
        {
          type: "field_dropdown",
          name: "PIN",
          options: ESP32_OUTPUT_PIN_OPTIONS,
        },
        {
          type: "field_number",
          name: "COUNT",
          value: 5,
          min: 1,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#1f7aec",
      tooltip: "Inicializa una tira NeoPixel para ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_neopixel_color",
      message0: "%{BKY_1BOT_ESP32_LIGHT_COLOR}",
      args0: [
        {
          type: "field_colour",
          name: "COLOR",
          colour: "#FF00FF",
        },
      ],
      output: "Number",
      colour: "#1f7aec",
      tooltip: "Devuelve un color para NeoPixel",
      helpUrl: "",
    },
    {
      type: "esp32_neopixel_set_color",
      message0: "%{BKY_1BOT_ESP32_LIGHT_SET_COLOR}",
      args0: [
        {
          type: "field_number",
          name: "INDEX",
          value: 1,
          min: 1,
        },
        {
          type: "input_value",
          name: "COLOR",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#1f7aec",
      tooltip: "Asigna un color a un LED de la tira",
      helpUrl: "",
    },
    {
      type: "esp32_neopixel_set_rgb",
      message0: "%{BKY_1BOT_ESP32_LIGHT_SET_RGB}",
      args0: [
        {
          type: "field_number",
          name: "INDEX",
          value: 1,
          min: 1,
        },
        {
          type: "field_number",
          name: "RED",
          value: 125,
          min: 0,
          max: 255,
        },
        {
          type: "field_number",
          name: "GREEN",
          value: 0,
          min: 0,
          max: 255,
        },
        {
          type: "field_number",
          name: "BLUE",
          value: 125,
          min: 0,
          max: 255,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#1f7aec",
      tooltip: "Asigna un color RGB a un LED de la tira",
      helpUrl: "",
    },
    {
      type: "esp32_neopixel_clear",
      message0: "%{BKY_1BOT_ESP32_LIGHT_CLEAR}",
      previousStatement: null,
      nextStatement: null,
      colour: "#1f7aec",
      tooltip: "Apaga todos los LEDs de la tira",
      helpUrl: "",
    },
  ]);
}
