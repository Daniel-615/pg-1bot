import type * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../generator";
import { cppStringLiteral, escapeJsonString } from "../utils/cppLiterals";

const ORDER_ATOMIC = 0;

export function registerJsonGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["json_object"] = (block) => {
    const jsonBlock = block as Blockly.Block & { itemCount_?: number };
    const itemCount = jsonBlock.itemCount_ ?? 1;
    const parts: string[] = ['String("{")'];

    for (let index = 0; index < itemCount; index += 1) {
      const key = block.getFieldValue(`KEY${index}`) || `campo${index + 1}`;
      const pairPrefix = `${escapeJsonString(key)}:`;
      const valueCode = generator.getJsonValueCode(block, `VALUE${index}`);

      if (index > 0) {
        parts.push('String(",")');
      }

      parts.push(`String(${cppStringLiteral(pairPrefix)})`);
      parts.push(valueCode);
    }

    parts.push('String("}")');
    return [parts.join(" + "), ORDER_ATOMIC];
  };
}
