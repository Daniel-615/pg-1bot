import * as Blockly from "blockly";

export function defineEsp32PinBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "esp32_pin_mode",
      message0: "%{BKY_1BOT_ESP32_PIN_MODE}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 2,
          min: 0,
          max: 39,
        },
        {
          type: "field_dropdown",
          name: "MODE",
          options: [
            ["OUTPUT", "OUTPUT"],
            ["INPUT", "INPUT"],
            ["INPUT_PULLUP", "INPUT_PULLUP"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#8e44ad",
      tooltip: "Configura el modo de un pin del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_digital_write",
      message0: "%{BKY_1BOT_ESP32_PIN_DIGITAL_WRITE}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 2,
          min: 0,
          max: 39,
        },
        {
          type: "field_dropdown",
          name: "STATE",
          options: [
            ["HIGH", "HIGH"],
            ["LOW", "LOW"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#8e44ad",
      tooltip: "Escribe un valor digital en un pin del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_digital_read",
      message0: "%{BKY_1BOT_ESP32_PIN_DIGITAL_READ}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 0,
          min: 0,
          max: 39,
        },
      ],
      output: "Number",
      colour: "#8e44ad",
      tooltip: "Lee el valor digital de un pin del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_analog_read",
      message0: "%{BKY_1BOT_ESP32_PIN_ANALOG_READ}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 32,
          min: 0,
          max: 39,
        },
      ],
      output: "Number",
      colour: "#8e44ad",
      tooltip: "Lee el valor analogo de un pin del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_pwm_write",
      message0: "%{BKY_1BOT_ESP32_PIN_PWM_WRITE}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 22,
          min: 0,
          max: 39,
        },
        {
          type: "field_number",
          name: "FREQUENCY",
          value: 1000,
          min: 1,
        },
        {
          type: "field_number",
          name: "DUTY",
          value: 128,
          min: 0,
          max: 255,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#8e44ad",
      tooltip: "Configura una salida PWM en un pin del ESP32",
      helpUrl: "",
    },
    {
      type: "esp32_analog_write",
      message0: "%{BKY_1BOT_ESP32_PIN_ANALOG_WRITE}",
      args0: [
        {
          type: "field_number",
          name: "PIN",
          value: 22,
          min: 0,
          max: 39,
        },
        {
          type: "field_number",
          name: "VALUE",
          value: 128,
          min: 0,
          max: 255,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#8e44ad",
      tooltip: "Escribe un valor analogo usando PWM en un pin del ESP32",
      helpUrl: "",
    },
  ]);
}
