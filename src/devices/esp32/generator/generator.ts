import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../../base/generator/generator";
import { registerESP32DisplayGenerator } from "./display/displayGenerator";
import { registerESP32LightGenerator } from "./lights/lightsGenerator";
import { registerESP32PinGenerator } from "./pins/pinsGenerator";
import { registerESP32SensorGenerator } from "./sensors/sensorsGenerator";
import { registerESP32WifiGenerator } from "./wifi/wifiGenerator";
export class ESP32Generator extends ArduinoBaseGenerator {
    constructor() {
        super("ESP32");
    }

    init(workspace: Blockly.Workspace) {
        super.init(workspace);

        this.addReservedWords(
            "setup,loop,pinMode,digitalWrite,digitalRead,analogRead,delay,delayMicroseconds,HIGH,LOW,INPUT,OUTPUT,Serial,WiFi,Wire,touchRead,pulseIn,ledcSetup,ledcAttachPin,ledcWrite,WebServer,LiquidCrystal_I2C,Adafruit_NeoPixel",
        );
        registerESP32DisplayGenerator(this);
        registerESP32LightGenerator(this);
        registerESP32PinGenerator(this);
        registerESP32SensorGenerator(this);
        registerESP32WifiGenerator(this);
        this.forBlock["program_start"] = (block: Blockly.Block) => {
            const body = this.statementToCode(block, "DO");

            return `
                ${Array.from(this.includes).join("\n")}
                ${Array.from(this.globalDefinitions).join("\n")}

                void setup() {
                    Serial.begin(115200);
                    delay(100);
                    ${Array.from(this.setupDefinitions).join("\n")}
                    }

                void loop() {
                    ${body}
                }
            `;
        };
    }
}
