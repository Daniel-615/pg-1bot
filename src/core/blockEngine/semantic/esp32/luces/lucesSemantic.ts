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

interface LucesHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  registerPinUsage(block: Blockly.Block, pin: string, mode: PinMode): void;
}

export class LucesSemantic {
  private hasNeoPixelInit = false;
  private neoPixelConfig: string | null = null;
  private readonly host: LucesHost;

  constructor(host: LucesHost) {
    this.host = host;
  }

  reset() {
    this.hasNeoPixelInit = false;
    this.neoPixelConfig = null;
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "esp32_neopixel_init": {
        const config = `${block.getFieldValue("PIN")}:${block.getFieldValue("COUNT")}`;
        if (this.neoPixelConfig && this.neoPixelConfig !== config) {
          this.host.addIssue(
            block,
            "Ya inicializaste NeoPixel con otra configuracion. Usa una sola inicializacion por programa",
            "warning"
          );
        }
        this.neoPixelConfig = this.neoPixelConfig ?? config;
        this.hasNeoPixelInit = true;
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "neopixel");
        return true;
      }

      case "esp32_neopixel_set_color":
      case "esp32_neopixel_set_rgb":
      case "esp32_neopixel_clear":
        if (!this.hasNeoPixelInit) {
          this.host.addIssue(
            block,
            "Debes inicializar la tira NeoPixel antes de controlar sus LEDs",
            "error"
          );
        }
        return true;

      default:
        return false;
    }
  }
}
