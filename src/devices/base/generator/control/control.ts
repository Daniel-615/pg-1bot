import * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../generator";
const ORDER_NONE = 99;
export function registerControlGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["if"] = (block) => {
    const condition =
      generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

    const ifCode =
      generator.statementToCode(block, "IF_BODY");

    return `if(${condition}) {\n${ifCode}}\n`;
  }
  generator.forBlock["if_else"] = (block) => {
    const condition =
      generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

    const ifCode =
      generator.statementToCode(block, "IF_BODY");

    const elseCode =
      generator.statementToCode(block, "ELSE_BODY");

    let code = `if(${condition}) {\n${ifCode}}\n`;

    if (elseCode) {
      code += `else {\n${elseCode}}\n`;
    }

    return code;
  }

  generator.forBlock["while_repeat"] = (block) => {
    const condition =
      generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

    const bodyCode =
      generator.statementToCode(block, "BODY");

    return `while(${condition}) {\n${bodyCode}}\n`;
  };
  generator.forBlock["print_list"] = function (block) {
    const list = generator.valueToCode(block, "LIST", 0) || "[]";

    return `
      for (const auto& item : ${list}) {
        Serial.println(item);
      }
      `;
  };
  generator.forBlock["repeat_until"] = function (block, generator) {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";
    const body = generator.statementToCode(block, "BODY");
    return `while (!(${condition})) {\n${body}}\n`;
  }
  generator.forBlock["do_while"] = (block) => {
    const condition =
      generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

    const bodyCode =
      generator.statementToCode(block, "BODY");

    return `do {\n${bodyCode}} while(${condition});\n`;
  };
  generator.forBlock["for_range"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );

    const from =
      generator.valueToCode(block, "FROM", ORDER_NONE) || "0";

    const to =
      generator.valueToCode(block, "TO", ORDER_NONE) || "0";

    const step = block.getFieldValue("STEP") || "1";

    const body =
      generator.statementToCode(block, "BODY");

    const comparator = Number(step) >= 0 ? "<=" : ">=";
    return `for (int ${variable} = ${from}; ${variable} ${comparator} ${to}; ${variable} += ${step}) {\n${body}}\n`;
  };
}