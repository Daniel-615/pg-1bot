import { blocklyText } from "../../../blockly/messages";

export function getArduinoUnoSerialCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_UNO_SERIAL"),
      colour: "#74d11f",
      contents: [
        {
          kind: "block",
          type: "arduino_uno_serial_write",
          inputs: {
            TEXT: { shadow: { type: "string", fields: { STRING: "hello" } } },
          },
        },
        { kind: "block", type: "arduino_uno_serial_available" },
        { kind: "block", type: "arduino_uno_serial_read" },
      ],
    },
  ];
}
