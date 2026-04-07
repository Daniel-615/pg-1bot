import * as Blockly from "blockly";

export function defineArduinoUnoPinBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "arduino_uno_digital_read",
      message0: "%{BKY_1BOT_ARDUINO_UNO_PIN_DIGITAL_READ}",
      args0: [
        { type: "field_number", name: "PIN", value: 9, min: 0, max: 13, precision: 1 },
      ],
      output: "Number",
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_analog_read",
      message0: "%{BKY_1BOT_ARDUINO_UNO_PIN_ANALOG_READ}",
      args0: [
        { type: "field_dropdown", name: "PIN", options: [["A0", "A0"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"]] },
      ],
      output: "Number",
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_pulse_in",
      message0: "%{BKY_1BOT_ARDUINO_UNO_PIN_PULSE_IN}",
      args0: [
        { type: "field_number", name: "PIN", value: 13, min: 0, max: 13, precision: 1 },
        { type: "field_dropdown", name: "STATE", options: [["HIGH", "HIGH"], ["LOW", "LOW"]] },
        { type: "field_number", name: "TIMEOUT", value: 30000, min: 1, precision: 1 },
      ],
      output: "Number",
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_digital_write",
      message0: "%{BKY_1BOT_ARDUINO_UNO_PIN_DIGITAL_WRITE}",
      args0: [
        { type: "field_number", name: "PIN", value: 9, min: 0, max: 13, precision: 1 },
        { type: "field_dropdown", name: "STATE", options: [["alto", "HIGH"], ["bajo", "LOW"]] },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_pwm_write",
      message0: "%{BKY_1BOT_ARDUINO_UNO_PIN_PWM_WRITE}",
      args0: [
        { type: "field_dropdown", name: "PIN", options: [["3", "3"], ["5", "5"], ["6", "6"], ["9", "9"], ["10", "10"], ["11", "11"]] },
        { type: "field_number", name: "VALUE", value: 0, min: 0, max: 255, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_tone_play",
      message0: "%{BKY_1BOT_ARDUINO_UNO_TONE_PLAY}",
      args0: [
        { type: "field_number", name: "PIN", value: 9, min: 0, max: 13, precision: 1 },
        { type: "field_number", name: "FREQUENCY", value: 440, min: 1, precision: 1 },
        { type: "field_number", name: "DURATION", value: 200, min: 1, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_servo_attach",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SERVO_ATTACH}",
      args0: [
        { type: "field_number", name: "PIN", value: 9, min: 0, max: 13, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#4a89dc",
    },
    {
      type: "arduino_uno_servo_write",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SERVO_WRITE}",
      args0: [
        { type: "field_number", name: "PIN", value: 9, min: 0, max: 13, precision: 1 },
        { type: "field_number", name: "ANGLE", value: 90, min: 0, max: 180, precision: 1 },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#4a89dc",
    },
  ]);
}
