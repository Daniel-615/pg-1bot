import * as Blockly from "blockly";

export function defineArduinoUnoSerialBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "arduino_uno_serial_write",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SERIAL_WRITE}",
      args0: [
        { type: "input_value", name: "TEXT" },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: "#74d11f",
    },
    {
      type: "arduino_uno_serial_available",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SERIAL_AVAILABLE}",
      output: "Number",
      colour: "#74d11f",
    },
    {
      type: "arduino_uno_serial_read",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SERIAL_READ}",
      output: "Number",
      colour: "#74d11f",
    },
  ]);
}
