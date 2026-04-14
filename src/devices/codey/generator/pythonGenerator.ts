import * as Blockly from "blockly";
import type { CodeyGenerator } from "../generator";

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;
const PYTHON_INDENT = "    ";

function prefixLines(code: string, prefix: string) {
  return code
    .split("\n")
    .map((line) => (line ? `${prefix}${line}` : line))
    .join("\n");
}

function ensureIndentedBody(code: string, indentLevel = 1) {
  if (!code.trim()) {
    return `${PYTHON_INDENT.repeat(indentLevel)}pass\n`;
  }

  return prefixLines(code, PYTHON_INDENT.repeat(indentLevel));
}

export function registerCodeyPythonGenerators(generator: CodeyGenerator) {
  generator.forBlock["program_start"] = (block) => {
    const body = generator.statementToCode(block, "DO");
    const imports = new Set(["import codey", "import event", "import time"]);

    for (const include of generator.includes) {
      imports.add(include);
    }

    const loopBody = body.trim() ? prefixLines(body, PYTHON_INDENT) : `${PYTHON_INDENT.repeat(2)}pass\n`;

    return `${Array.from(imports).join("\n")}

def _1bot_main():
    while True:
${loopBody}

event.start(_1bot_main)
`;
  };

  generator.forBlock["string"] = (block) => {
    const text = block.getFieldValue("STRING") || "";
    return [JSON.stringify(text), ORDER_ATOMIC];
  };

  generator.forBlock["print"] = (block) => {
    const value = generator.valueToCode(block, "TEXT", ORDER_NONE) || '""';
    return `print(${value})\n`;
  };

  generator.forBlock["delay_ms"] = (block) => {
    const time = Number(block.getFieldValue("TIME") || 0);
    return `time.sleep(${time / 1000})\n`;
  };

  generator.forBlock["break"] = () => {
    return "break\n";
  };

  generator.forBlock["continue"] = () => {
    return "continue\n";
  };

  generator.forBlock["math_number"] = (block) => {
    const num = block.getFieldValue("NUM") || 0;
    return [`${num}`, ORDER_ATOMIC];
  };

  generator.forBlock["number"] = (block) => {
    const num = block.getFieldValue("NUM") || 0;
    return [`${num}`, ORDER_ATOMIC];
  };

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
    const value = generator.valueToCode(block, "VALUE", ORDER_NONE) || "0";
    return `${variable} = ${value}\n`;
  };

  generator.forBlock["if"] = (block) => {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "False";
    const ifBody = ensureIndentedBody(generator.statementToCode(block, "IF_BODY"));
    return `if ${condition}:\n${ifBody}`;
  };

  generator.forBlock["if_else"] = (block) => {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "False";
    const ifBody = ensureIndentedBody(generator.statementToCode(block, "IF_BODY"));
    const elseBody = ensureIndentedBody(generator.statementToCode(block, "ELSE_BODY"));
    return `if ${condition}:\n${ifBody}else:\n${elseBody}`;
  };

  generator.forBlock["while_repeat"] = (block) => {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "False";
    const body = ensureIndentedBody(generator.statementToCode(block, "BODY"));
    return `while ${condition}:\n${body}`;
  };

  generator.forBlock["repeat_until"] = (block) => {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "False";
    const body = ensureIndentedBody(generator.statementToCode(block, "BODY"));
    return `while not (${condition}):\n${body}`;
  };

  generator.forBlock["do_while"] = (block) => {
    const condition = generator.valueToCode(block, "CONDITION", ORDER_NONE) || "False";
    const body = ensureIndentedBody(generator.statementToCode(block, "BODY"));
    return `while True:\n${body}${PYTHON_INDENT}if not (${condition}):\n${PYTHON_INDENT.repeat(2)}break\n`;
  };

  generator.forBlock["for_range"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    const from = generator.valueToCode(block, "FROM", ORDER_NONE) || "0";
    const to = generator.valueToCode(block, "TO", ORDER_NONE) || "0";
    const step = Number(block.getFieldValue("STEP") || 1);
    const body = ensureIndentedBody(generator.statementToCode(block, "BODY"));
    return `for ${variable} in range(int(${from}), int(${to}) + 1, ${step}):\n${body}`;
  };

  generator.forBlock["logic_boolean"] = (block) => {
    const bool = block.getFieldValue("BOOL") === "TRUE" ? "True" : "False";
    return [bool, ORDER_ATOMIC];
  };

  generator.forBlock["logic_greater"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} > ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["logic_less"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} < ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["logic_equal"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} == ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["logic_and"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "False";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "False";
    return [`${a} and ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["logic_or"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "False";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "False";
    return [`${a} or ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["logic_not"] = (block) => {
    const value = generator.valueToCode(block, "BOOL", ORDER_ATOMIC) || "False";
    return [`not ${value}`, ORDER_ATOMIC];
  };

  generator.forBlock["math_add"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} + ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["math_subtract"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} - ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["math_multiply"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
    return [`${a} * ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["math_divide"] = (block) => {
    const a = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
    const b = generator.valueToCode(block, "B", ORDER_ATOMIC) || "1";
    return [`${a} / ${b}`, ORDER_ATOMIC];
  };

  generator.forBlock["math_random"] = (block) => {
    const min = generator.valueToCode(block, "MIN", ORDER_NONE) || "0";
    const max = generator.valueToCode(block, "MAX", ORDER_NONE) || "10";
    generator.addInclude("import random");
    return [`random.randint(int(${min}), int(${max}))`, ORDER_ATOMIC];
  };

  generator.forBlock["lists_create_empty"] = () => {
    return ["[]", ORDER_ATOMIC];
  };

  generator.forBlock["lists_create_with"] = (block) => {
    const listBlock = block as Blockly.Block & { itemCount_?: number };
    const itemCount = listBlock.itemCount_ ?? 0;
    const items: string[] = [];

    for (let i = 0; i < itemCount; i += 1) {
      const itemCode = generator.valueToCode(block, `ADD${i}`, ORDER_NONE) || "0";
      items.push(itemCode);
    }

    return [`[${items.join(", ")}]`, ORDER_ATOMIC];
  };

  generator.forBlock["lists_length"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "[]";
    return [`len(${value})`, ORDER_ATOMIC];
  };

  generator.forBlock["list_var_get_index"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    const where = block.getFieldValue("WHERE") || "FROM_START";

    let indexCode = "0";
    if (where === "LAST") {
      indexCode = "-1";
    } else if (where === "FROM_START") {
      indexCode = generator.valueToCode(block, "AT", ORDER_NONE) || "0";
    }

    return [`${variable}[${indexCode}]`, ORDER_ATOMIC];
  };

  generator.forBlock["list_var_set_index"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    const where = block.getFieldValue("WHERE") || "FROM_START";
    const valueCode = generator.valueToCode(block, "TO", ORDER_NONE) || "0";

    let indexCode = "0";
    if (where === "LAST") {
      indexCode = "-1";
    } else if (where === "FROM_START") {
      indexCode = generator.valueToCode(block, "AT", ORDER_NONE) || "0";
    }

    return `${variable}[${indexCode}] = ${valueCode}\n`;
  };

  generator.forBlock["json_object"] = (block) => {
    const jsonBlock = block as Blockly.Block & { itemCount_?: number };
    const itemCount = jsonBlock.itemCount_ ?? 1;
    const parts: string[] = [];

    for (let index = 0; index < itemCount; index += 1) {
      const key = block.getFieldValue(`KEY${index}`) || `campo${index + 1}`;
      const valueCode = generator.valueToCode(block, `VALUE${index}`, ORDER_NONE) || '""';
      parts.push(`${JSON.stringify(key)}: ${valueCode}`);
    }

    return [`{${parts.join(", ")}}`, ORDER_ATOMIC];
  };
}
