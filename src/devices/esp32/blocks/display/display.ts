import * as Blockly from "blockly";

export function defineEsp32DisplayBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "esp32_display_init",
      message0: "%{BKY_1BOT_ESP32_DISPLAY_INIT}",
      args0: [
        {
          type: "field_number",
          name: "SCL",
          value: 22,
          min: 0,
          max: 39,
        },
        {
          type: "field_number",
          name: "SDA",
          value: 21,
          min: 0,
          max: 39,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#16a085",
      tooltip: "Inicializa una pantalla LCD I2C en ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_display_print",
      message0: "%{BKY_1BOT_ESP32_DISPLAY_PRINT}",
      args0: [
        {
          type: "field_number",
          name: "X",
          value: 1,
          min: 0,
        },
        {
          type: "field_number",
          name: "Y",
          value: 1,
          min: 0,
        },
        {
          type: "input_value",
          name: "TEXT",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#16a085",
      tooltip: "Muestra un texto en la pantalla LCD",
      helpUrl: "",
    },
    {
      type: "esp32_display_clear",
      message0: "%{BKY_1BOT_ESP32_DISPLAY_CLEAR}",
      previousStatement: null,
      nextStatement: null,
      colour: "#16a085",
      tooltip: "Limpia la pantalla LCD",
      helpUrl: "",
    },
  ]);
}
