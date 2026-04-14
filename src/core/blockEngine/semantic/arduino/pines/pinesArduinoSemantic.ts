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

interface ArduinoPinHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  registerPinUsage(block: Blockly.Block, pin: string, mode: PinMode): void;
  handleCheckUnusedExpression(block: Blockly.Block): void;
}

export class PinesArduinoSemantic {
  private attachedServoPins = new Set<string>();
  private readonly host: ArduinoPinHost;

  constructor(host: ArduinoPinHost) {
    this.host = host;
  }

  reset() {
    this.attachedServoPins = new Set();
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "arduino_uno_digital_write": {
        const pin = block.getFieldValue("PIN");
        this.warnUnoSerialPin(block, pin);
        this.host.registerPinUsage(block, pin, "digital_output");
        return true;
      }

      case "arduino_uno_digital_read":
      case "arduino_uno_pulse_in": {
        const pin = block.getFieldValue("PIN");
        this.warnUnoSerialPin(block, pin);
        this.host.registerPinUsage(block, pin, "digital_input");
        this.host.handleCheckUnusedExpression(block);
        return true;
      }

      case "arduino_uno_analog_read":
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "analog_input");
        this.host.handleCheckUnusedExpression(block);
        return true;

      case "arduino_uno_pwm_write":
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "pwm_output");
        return true;

      case "arduino_uno_servo_attach": {
        const pin = block.getFieldValue("PIN");
        this.warnUnoSerialPin(block, pin);
        this.attachedServoPins.add(pin);
        this.host.registerPinUsage(block, pin, "servo_output");
        return true;
      }

      case "arduino_uno_servo_write": {
        const pin = block.getFieldValue("PIN");
        if (!this.attachedServoPins.has(pin)) {
          this.host.addIssue(
            block,
            "El servo se conectara automaticamente en ese pin. Puedes omitir el bloque de conectar servo si quieres",
            "suggestion"
          );
        }
        this.warnUnoSerialPin(block, pin);
        this.host.registerPinUsage(block, pin, "servo_output");
        return true;
      }

      case "arduino_uno_tone_play": {
        const pin = block.getFieldValue("PIN");
        this.warnUnoSerialPin(block, pin);
        this.host.registerPinUsage(block, pin, "tone_output");
        return true;
      }

      default:
        return false;
    }
  }

  private warnUnoSerialPin(block: Blockly.Block, pin: string) {
    if (["0", "1"].includes(pin)) {
      this.host.addIssue(
        block,
        "Los pines 0 y 1 en Arduino Uno se usan tambien para Serial. Evita usarlos si trabajas con puerto serie",
        "warning"
      );
    }
  }
}
