import * as Blockly from "blockly";
import { ESP32Generator } from "../generator";

const ORDER_ATOMIC = 0;
const DHT_INSTANCE = "_1botEsp32Dht";

function ensureDht(generator: ESP32Generator, pin: string, type: string) {
  generator.addInclude("#include <DHT.h>");
  generator.addGlobalDefinition(`DHT ${DHT_INSTANCE}(${pin}, ${type});`, "esp32_dht_instance");
  generator.addSetupDefinition(`${DHT_INSTANCE}.begin();`, "esp32_dht_setup");
}

function getServoInstance(pin: string) {
  return `_1botServo_${pin}`;
}

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

  generator.forBlock["esp32_dht_init"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "4";
    const type = block.getFieldValue("TYPE") || "DHT11";

    ensureDht(generator, pin, type);
    return "";
  };

  generator.forBlock["esp32_dht_temperature"] = () => {
    generator.addInclude("#include <DHT.h>");
    return [`${DHT_INSTANCE}.readTemperature()`, ORDER_ATOMIC];
  };

  generator.forBlock["esp32_dht_humidity"] = () => {
    generator.addInclude("#include <DHT.h>");
    return [`${DHT_INSTANCE}.readHumidity()`, ORDER_ATOMIC];
  };

  generator.forBlock["esp32_servo_attach"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "18";
    const instance = getServoInstance(pin);

    generator.addInclude("#include <ESP32Servo.h>");
    generator.addGlobalDefinition(`Servo ${instance};`);
    generator.addSetupDefinition(`${instance}.attach(${pin});`);
    return "";
  };

  generator.forBlock["esp32_servo_write"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "18";
    const angle = block.getFieldValue("ANGLE") || "90";
    const instance = getServoInstance(pin);

    generator.addInclude("#include <ESP32Servo.h>");
    generator.addGlobalDefinition(`Servo ${instance};`);
    return `${instance}.write(${angle});\n`;
  };

  generator.forBlock["esp32_tone_play"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "25";
    const frequency = block.getFieldValue("FREQUENCY") || "440";
    const duration = block.getFieldValue("DURATION") || "200";
    const channel = generator.getPwmChannelForPin(`tone_${pin}`);

    generator.addSetupDefinition(`
      ledcSetup(${channel}, ${frequency}, 8);
      ledcAttachPin(${pin}, ${channel});
    `);

    return `ledcWriteTone(${channel}, ${frequency});\ndelay(${duration});\nledcWriteTone(${channel}, 0);\n`;
  };

  generator.forBlock["esp32_tone_stop"] = (block: Blockly.Block) => {
    const pin = block.getFieldValue("PIN") || "25";
    const channel = generator.getPwmChannelForPin(`tone_${pin}`);

    return `ledcWriteTone(${channel}, 0);\n`;
  };
}
