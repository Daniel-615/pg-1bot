import * as Blockly from "blockly";

type Severity = "error" | "warning" | "suggestion";
type PinMode =
  | "digital_output"
  | "digital_input"
  | "analog_input"
  | "pwm_output"
  | "touch_input"
  | "ultrasonic_trig"
  | "ultrasonic_echo"
  | "neopixel"
  | "servo_output"
  | "tone_output"
  | "pin_mode";

interface ArduinoSensorHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  registerPinUsage(block: Blockly.Block, pin: string, mode: PinMode): void;
  handleCheckUnusedExpression(block: Blockly.Block): void;
}

export class SensoresArduinoSemantic {
  private readonly host: ArduinoSensorHost;

  constructor(host: ArduinoSensorHost) {
    this.host = host;
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "arduino_uno_sensor_ultrasonico": {
        const trig = block.getFieldValue("TRIG");
        const echo = block.getFieldValue("ECHO");
        if (trig && echo && trig === echo) {
          this.host.addIssue(block, "TRIG y ECHO no deberian usar el mismo pin", "warning");
        }
        this.host.registerPinUsage(block, trig, "ultrasonic_trig");
        this.host.registerPinUsage(block, echo, "ultrasonic_echo");
        this.host.handleCheckUnusedExpression(block);
        return true;
      }

      default:
        return false;
    }
  }
}
