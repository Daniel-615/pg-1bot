import { blocklyText } from "../../../blockly/messages";

export function getArduinoUnoPinCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_UNO_PIN"),
      colour: "#4a89dc",
      contents: [
        { kind: "block", type: "arduino_uno_digital_read" },
        { kind: "block", type: "arduino_uno_analog_read" },
        { kind: "block", type: "arduino_uno_pulse_in" },
        { kind: "block", type: "arduino_uno_digital_write" },
        { kind: "block", type: "arduino_uno_pwm_write" },
        { kind: "block", type: "arduino_uno_tone_play" },
        { kind: "block", type: "arduino_uno_servo_attach" },
        { kind: "block", type: "arduino_uno_servo_write" },
      ],
    },
  ];
}
