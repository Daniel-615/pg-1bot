import { blocklyText } from "../../../blockly/messages";

export function getArduinoUnoDataCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_UNO_DATA"),
      colour: "#b620e0",
      contents: [
        {
          kind: "block",
          type: "arduino_uno_math_map",
          inputs: {
            VALUE: { shadow: { type: "number", fields: { NUM: 50 } } },
            FROM_LOW: { shadow: { type: "number", fields: { NUM: 1 } } },
            FROM_HIGH: { shadow: { type: "number", fields: { NUM: 100 } } },
            TO_LOW: { shadow: { type: "number", fields: { NUM: 1 } } },
            TO_HIGH: { shadow: { type: "number", fields: { NUM: 255 } } },
          },
        },
        {
          kind: "block",
          type: "arduino_uno_math_constrain",
          inputs: {
            VALUE: { shadow: { type: "number", fields: { NUM: 50 } } },
            LOW: { shadow: { type: "number", fields: { NUM: 1 } } },
            HIGH: { shadow: { type: "number", fields: { NUM: 100 } } },
          },
        },
        {
          kind: "block",
          type: "arduino_uno_number_to_int",
          inputs: {
            VALUE: { shadow: { type: "number", fields: { NUM: 123 } } },
          },
        },
        {
          kind: "block",
          type: "arduino_uno_ascii_to_char",
          inputs: {
            VALUE: { shadow: { type: "number", fields: { NUM: 97 } } },
          },
        },
        {
          kind: "block",
          type: "arduino_uno_char_to_ascii",
          inputs: {
            VALUE: { shadow: { type: "string", fields: { STRING: "a" } } },
          },
        },
      ],
    },
  ];
}
