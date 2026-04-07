import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../../base/generator/generator";
import { registerESP32DisplayGenerator } from "./display/displayGenerator";
import { registerESP32LightGenerator } from "./lights/lightsGenerator";
import { registerESP32PinGenerator } from "./pins/pinsGenerator";
import { registerESP32SensorGenerator } from "./sensors/sensorsGenerator";
import { registerESP32WifiGenerator } from "./wifi/wifiGenerator";

export class ESP32Generator extends ArduinoBaseGenerator {
  private pwmChannelsByPin: Map<string, number>;

  constructor() {
    super("ESP32");
    this.pwmChannelsByPin = new Map();
    this.serialBaudRate = 115200;
    this.serialStartupDelayMs = 100;
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);
    this.pwmChannelsByPin = new Map();

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,digitalRead,analogRead,delay,delayMicroseconds,HIGH,LOW,INPUT,OUTPUT,INPUT_PULLUP,Serial,WiFi,Wire,touchRead,pulseIn,ledcSetup,ledcAttachPin,ledcWrite,ledcWriteTone,WebServer,LiquidCrystal_I2C,Adafruit_NeoPixel,HTTPClient,DHT,Servo",
    );

    this.registerEsp32Generators();
    this.forBlock["program_start"] = (block: Blockly.Block) => {
      const body = this.statementToCode(block, "DO");

      return `
                ${Array.from(this.includes).join("\n")}
                ${this.getAllGlobalDefinitions().join("\n")}

                void setup() {
                    ${this.getAllSetupDefinitions().join("\n")}
                }
                
                void loop() {
                    ${body}
                }
            `;
    };
  }

  getPwmChannelForPin(pin: string) {
    const existingChannel = this.pwmChannelsByPin.get(pin);

    if (existingChannel !== undefined) {
      return existingChannel;
    }

    for (let channel = 0; channel < 16; channel += 1) {
      if (!Array.from(this.pwmChannelsByPin.values()).includes(channel)) {
        this.pwmChannelsByPin.set(pin, channel);
        return channel;
      }
    }

    const fallbackChannel = 15;
    this.pwmChannelsByPin.set(pin, fallbackChannel);
    return fallbackChannel;
  }

  private registerEsp32Generators() {
    registerESP32DisplayGenerator(this);
    registerESP32LightGenerator(this);
    registerESP32PinGenerator(this);
    registerESP32SensorGenerator(this);
    registerESP32WifiGenerator(this);
  }
}
