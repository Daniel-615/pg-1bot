import { blocklyText } from "../../../blockly/messages";

export function getArduinoUnoSensorCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_UNO_SENSOR"),
      colour: "#4C97FF",
      contents: [
        {
          kind: "block",
          type: "arduino_uno_temporizador",
        },
        {
          kind: "block",
          type: "arduino_uno_reiniciar_temporizador",
        },
        {
          kind: "block",
          type: "arduino_uno_sensor_ultrasonico",
        },
      ],
    },
  ];
}
