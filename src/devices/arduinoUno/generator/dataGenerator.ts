import type { ArduinoUnoGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerDataGenerators(generator: ArduinoUnoGenerator) {
  generator.forBlock["arduino_uno_math_map"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "0";
    const fromLow = generator.valueToCode(block, "FROM_LOW", ORDER_ATOMIC) || "0";
    const fromHigh = generator.valueToCode(block, "FROM_HIGH", ORDER_ATOMIC) || "1023";
    const toLow = generator.valueToCode(block, "TO_LOW", ORDER_ATOMIC) || "0";
    const toHigh = generator.valueToCode(block, "TO_HIGH", ORDER_ATOMIC) || "255";
    return [`map(${value}, ${fromLow}, ${fromHigh}, ${toLow}, ${toHigh})`, ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_math_constrain"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "0";
    const low = generator.valueToCode(block, "LOW", ORDER_ATOMIC) || "0";
    const high = generator.valueToCode(block, "HIGH", ORDER_ATOMIC) || "100";
    return [`constrain(${value}, ${low}, ${high})`, ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_number_to_int"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "0";
    return [`((int)(${value}))`, ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_ascii_to_char"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "0";
    return [`String((char)(${value}))`, ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_char_to_ascii"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || '""';
    return [`((int)String(${value})[0])`, ORDER_ATOMIC];
  };
}
