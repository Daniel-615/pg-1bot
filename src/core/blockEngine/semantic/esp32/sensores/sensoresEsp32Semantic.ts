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

interface SensoresEsp32Host {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  registerPinUsage(block: Blockly.Block, pin: string, mode: PinMode): void;
}

export class SensoresEsp32Semantic {
  private hasDhtInit = false;
  private dhtConfig: string | null = null;
  private attachedServoPins = new Set<string>();
  private readonly host: SensoresEsp32Host;

  constructor(host: SensoresEsp32Host) {
    this.host = host;
  }

  reset() {
    this.hasDhtInit = false;
    this.dhtConfig = null;
    this.attachedServoPins = new Set();
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "esp32_dht_init": {
        const config = `${block.getFieldValue("PIN")}:${block.getFieldValue("TYPE")}`;
        if (this.dhtConfig && this.dhtConfig !== config) {
          this.host.addIssue(
            block,
            "Ya inicializaste el sensor DHT con otra configuracion. Usa una sola inicializacion por programa",
            "warning"
          );
        }
        this.dhtConfig = this.dhtConfig ?? config;
        this.hasDhtInit = true;
        return true;
      }

      case "esp32_dht_temperature":
      case "esp32_dht_humidity":
        if (!this.hasDhtInit) {
          this.host.addIssue(
            block,
            "Debes inicializar el sensor DHT antes de leer temperatura o humedad",
            "error"
          );
        }
        return true;

      case "esp32_servo_attach": {
        const pin = block.getFieldValue("PIN");
        if (this.isEsp32InputOnlyPin(pin)) {
          this.host.addIssue(
            block,
            `El pin ${pin} en ESP32 es solo de entrada y no sirve para un servo`,
            "error"
          );
        }
        this.attachedServoPins.add(pin);
        this.host.registerPinUsage(block, pin, "servo_output");
        return true;
      }

      case "esp32_servo_write": {
        const pin = block.getFieldValue("PIN");
        if (!this.attachedServoPins.has(pin)) {
          this.host.addIssue(
            block,
            "Debes conectar o inicializar el servo antes de moverlo",
            "error"
          );
        }
        this.host.registerPinUsage(block, pin, "servo_output");
        return true;
      }

      case "esp32_tone_play":
      case "esp32_tone_stop":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.host.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para buzzer`,
            "error"
          );
        }
        this.host.registerPinUsage(block, block.getFieldValue("PIN"), "tone_output");
        return true;

      case "esp32_ultrasonic_distance": {
        const trig = block.getFieldValue("TRIG");
        const echo = block.getFieldValue("ECHO");
        if (trig && echo && trig === echo) {
          this.host.addIssue(block, "TRIG y ECHO no deberían usar el mismo pin", "warning");
        }
        this.host.registerPinUsage(block, trig, "ultrasonic_trig");
        this.host.registerPinUsage(block, echo, "ultrasonic_echo");
        return true;
      }

      default:
        return false;
    }
  }

  private isEsp32InputOnlyPin(pin: string) {
    return ["34", "35", "36", "39"].includes(pin);
  }
}
