import * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../generator";

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

export function registerVariableGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["variables_get"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    return [variable, ORDER_ATOMIC];
  };

  generator.forBlock["variables_set"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    generator.addGlobalDefinition(
      generator.getCppVariableDeclaration(block, variable),
      `var_decl_${variable}`,
    );
    const value = generator.valueToCode(block, "VALUE", ORDER_NONE) || "0";
    return `${variable} = ${value};\n`;
  };
}
