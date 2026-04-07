import type { ArduinoBaseGenerator } from "../generator";

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

export function registerProgramGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["program_start"] = (block) => {
    const body = generator.statementToCode(block, "DO");

    return `
        ${Array.from(generator.includes).join("\n")}
        ${generator.getAllGlobalDefinitions().join("\n")}

        void setup() {
          ${generator.getAllSetupDefinitions().join("\n  ")}
        }
        void loop() {
        ${body}
        }
      `;
  };

  generator.forBlock["string"] = (block) => {
    const text = block.getFieldValue("STRING") || "";
    return [`"${text}"`, ORDER_ATOMIC];
  };

  generator.forBlock["print"] = (block) => {
    const value = generator.valueToCode(block, "TEXT", ORDER_NONE) || '""';
    generator.ensureSerial();
    return `Serial.println(${value});\n`;
  };

  generator.forBlock["led_set"] = (block) => {
    const pin = block.getFieldValue("PIN");
    const state = block.getFieldValue("STATE");
    generator.setupDefinitions.add(`pinMode(${pin}, OUTPUT);`);
    return `digitalWrite(${pin}, ${state});\n`;
  };

  generator.forBlock["delay_ms"] = (block) => {
    const time = block.getFieldValue("TIME");
    return `delay(${time});\n`;
  };

  generator.forBlock["break"] = () => {
    return "break;\n";
  };

  generator.forBlock["continue"] = () => {
    return "continue;\n";
  };

  generator.forBlock["math_number"] = (block) => {
    const num = block.getFieldValue("NUM");
    return [num, ORDER_ATOMIC];
  };

  generator.forBlock["number"] = (block) => {
    const num = block.getFieldValue("NUM") || 0;
    return [`${num}`, ORDER_ATOMIC];
  };
}
