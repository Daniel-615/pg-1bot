import * as Blockly from "blockly";

export function defineArduinoUnoSensorBlocks() {
  Blockly.defineBlocksWithJsonArray([
    {
      type: "arduino_uno_temporizador",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SENSOR_TEMPORIZADOR}",
      output: "Number",
      colour: "#4cbfe6",
      tooltip: "Devuelve el tiempo transcurrido desde el ultimo reinicio del temporizador."
    },
    {
      type: "arduino_uno_reiniciar_temporizador",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SENSOR_REINICIAR_TEMPORIZADOR}",
      previousStatement: null,
      nextStatement: null,
      colour: "#4cbfe6",
      tooltip: "Reinicia el temporizador del Arduino Uno."
    },
    {
      type: "arduino_uno_sensor_ultrasonico",
      message0: "%{BKY_1BOT_ARDUINO_UNO_SENSOR_ULTRASONIC}",
      args0: [
        {
          type: "field_number",
          name: "TRIG",
          value: 3,
          min: 0,
          max: 13,
          precision: 1,
        },
        {
          type: "field_number",
          name: "ECHO",
          value: 2,
          min: 0,
          max: 13,
          precision: 1,
        },
      ],
      output: "Number",
      colour: "#4cbfe6",
      tooltip: "Lee la distancia de un sensor ultrasonico usando pines de activacion y eco."
    }
  ]);
}
