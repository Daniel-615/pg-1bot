import * as Blockly from "blockly";

export function defineEsp32LightBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "esp32_neopixel_init",
      message0: "%{BKY_1BOT_ESP32_LIGHT_INIT}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 4,
          min: 0,
          max: 39,
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
