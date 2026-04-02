import * as Blockly from "blockly";
import { ESP32Generator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerESP32SensorGenerator(generator: ESP32Generator) {
  generator.forBlock["esp32_touch_read"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "13";
    return [`touchRead(${pin})`, ORDER_ATOMIC];
  };

  generator.forBlock["esp32_ultrasonic_distance"] = (block: Blockly.Block) => {
    const trig = block.getFieldValue("TRIG") || "2";
    const echo = block.getFieldValue("ECHO") || "5";

    generator.addSetupDefinition(`pinMode(${trig}, OUTPUT);`);
    generator.addSetupDefinition(`pinMode(${echo}, INPUT);`);

    return [
      `({ digitalWrite(${trig}, LOW); delayMicroseconds(2); digitalWrite(${trig}, HIGH); delayMicroseconds(10); digitalWrite(${trig}, LOW); pulseIn(${echo}, HIGH, 30000UL) * 0.0343 / 2; })`,
      ORDER_ATOMIC,
    ];
  };
}
