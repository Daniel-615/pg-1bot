import * as Blockly from "blockly";

export function defineArduinoUnoDataBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "arduino_uno_math_map",
      message0: "%{BKY_1BOT_DATA_MAP}",
      args0: [
        { type: "input_value", name: "VALUE", check: "Number" },
        { type: "input_value", name: "FROM_LOW", check: "Number" },
        { type: "input_value", name: "FROM_HIGH", check: "Number" },
        { type: "input_value", name: "TO_LOW", check: "Number" },
        { type: "input_value", name: "TO_HIGH", check: "Number" },
      ],
      inputsInline: true,
      output: "Number",
      colour: "#b620e0",
    },
    {
      type: "arduino_uno_math_constrain",
      message0: "%{BKY_1BOT_DATA_CONSTRAIN}",
      args0: [
        { type: "input_value", name: "VALUE", check: "Number" },
        { type: "input_value", name: "LOW", check: "Number" },
        { type: "input_value", name: "HIGH", check: "Number" },
      ],
      inputsInline: true,
      output: "Number",
      colour: "#b620e0",
    },
    {
      type: "arduino_uno_number_to_int",
      message0: "%{BKY_1BOT_DATA_TO_INT}",
      args0: [
        { type: "input_value", name: "VALUE", check: "Number" },
      ],
      inputsInline: true,
      output: "Number",
      colour: "#b620e0",
    },
    {
      type: "arduino_uno_ascii_to_char",
      message0: "%{BKY_1BOT_DATA_ASCII_TO_CHAR}",
      args0: [
        { type: "input_value", name: "VALUE", check: "Number" },
      ],
      inputsInline: true,
      output: "String",
      colour: "#b620e0",
    },
    {
      type: "arduino_uno_char_to_ascii",
      message0: "%{BKY_1BOT_DATA_CHAR_TO_ASCII}",
      args0: [
        { type: "input_value", name: "VALUE", check: "String" },
      ],
      inputsInline: true,
      output: "Number",
      colour: "#b620e0",
    },
  ]);
}
