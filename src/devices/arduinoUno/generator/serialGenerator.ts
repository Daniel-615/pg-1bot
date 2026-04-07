import type { ArduinoUnoGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerSerialGenerators(generator: ArduinoUnoGenerator) {
  generator.forBlock["arduino_uno_serial_write"] = (block) => {
    const text = generator.valueToCode(block, "TEXT", ORDER_ATOMIC) || '""';
    generator.ensureSerial();
    return `Serial.println(${text});\n`;
  };

  generator.forBlock["arduino_uno_serial_available"] = () => {
    generator.ensureSerial();
    return ["Serial.available()", ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_serial_read"] = () => {
    generator.ensureSerial();
    return ["Serial.read()", ORDER_ATOMIC];
  };
}
