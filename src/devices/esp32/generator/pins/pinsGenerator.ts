import * as Blockly from "blockly";
import { ESP32Generator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerESP32PinGenerator(generator: ESP32Generator) {
  generator.forBlock["esp32_pin_mode"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "2";
    const mode = block.getFieldValue("MODE") || "OUTPUT";

    generator.addSetupDefinition(`pinMode(${pin}, ${mode});`);
    return "";
  };

  generator.forBlock["esp32_digital_write"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "2";
    const state = block.getFieldValue("STATE") || "LOW";

    generator.addSetupDefinition(`pinMode(${pin}, OUTPUT);`);
    return `digitalWrite(${pin}, ${state});\n`;
  };

  generator.forBlock["esp32_digital_read"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "0";

    generator.addSetupDefinition(`pinMode(${pin}, INPUT);`);
    return [`digitalRead(${pin})`, ORDER_ATOMIC];
  };

  generator.forBlock["esp32_analog_read"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "32";

    return [`analogRead(${pin})`, ORDER_ATOMIC];
  };

  generator.forBlock["esp32_pwm_write"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "22";
    const frequency = block.getFieldValue("FREQUENCY") || "1000";
    const duty = block.getFieldValue("DUTY") || "128";
    const channel = generator.getPwmChannelForPin(pin);

    generator.addSetupDefinition(`
      ledcSetup(${channel}, ${frequency}, 8);
      ledcAttachPin(${pin}, ${channel});
    `);

    return `ledcWrite(${channel}, ${duty});\n`;
  };

  generator.forBlock["esp32_analog_write"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "22";
    const value = block.getFieldValue("VALUE") || "128";
    const channel = generator.getPwmChannelForPin(pin);

    generator.addSetupDefinition(`
      ledcSetup(${channel}, 5000, 8);
      ledcAttachPin(${pin}, ${channel});
    `);

    return `ledcWrite(${channel}, ${value});\n`;
  };
}
