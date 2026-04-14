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

interface PinesEsp32Host {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  registerPinUsage(block: Blockly.Block, pin: string, mode: PinMode): void;
}

export class PinesEsp32Semantic {
  private readonly host: PinesEsp32Host;

  constructor(host: PinesEsp32Host) {
    this.host = host;
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "esp32_pin_mode": {
        const pin = block.getFieldValue("PIN");
        const mode = block.getFieldValue("MODE");
        if (mode === "OUTPUT" && this.isEsp32InputOnlyPin(pin)) {
          this.host.addIssue(
            block,
            `El pin ${pin} en ESP32 es solo de entrada y no puede configurarse como OUTPUT`,
            "error"
          );
        }
        this.host.registerPinUsage(block, pin, "pin_mode");
        return true;
      }

      case "esp32_digital_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve como salida digital`,
            "error"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "digital_output");
        return true;

      case "esp32_digital_read":
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "digital_input");
        return true;

      case "esp32_analog_read":
        if (!this.isEsp32AdcPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} no suele ser valido para lectura analogica en ESP32`,
            "warning"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "analog_input");
        return true;

      case "esp32_pwm_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para PWM`,
            "error"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "pwm_output");
        return true;

      case "esp32_analog_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para salida analoga por PWM`,
            "error"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "pwm_output");
        return true;

      case "esp32_touch_read":
        if (!this.isEsp32TouchPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} no tiene capacidad touch en ESP32`,
            "warning"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "touch_input");
        return true;

      default:
        return false;
    }
  }

  private isEsp32InputOnlyPin(pin: string) {
    return ["34", "35", "36", "39"].includes(pin);
  }

  private isEsp32AdcPin(pin: string) {
    return [
      "0", "2", "4", "12", "13", "14", "15", "25", "26", "27", "32", "33", "34", "35", "36", "39",
    ].includes(pin);
  }

  private isEsp32TouchPin(pin: string) {
    return ["0", "2", "4", "12", "13", "14", "15", "27", "32", "33"].includes(pin);
  }
}
