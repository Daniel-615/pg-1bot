import * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../generator";
import { inferListCppType } from "../utils/typeInference";

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

export function registerListGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["lists_create_empty"] = () => {
    generator.addInclude("#include <vector>");
    return ["std::vector<int>{}", ORDER_ATOMIC];
  };

  generator.forBlock["lists_create_with"] = (block) => {
    generator.addInclude("#include <vector>");
    const listCppType = inferListCppType(block);
    const items: string[] = [];
    const listBlock = block as Blockly.Block & { itemCount_?: number };
    const itemCount = listBlock.itemCount_ ?? 0;

    if (itemCount === 1) {
      const itemBlock = block.getInputTargetBlock("ADD0");
      const itemChecks = itemBlock?.outputConnection?.getCheck() ?? [];

      if (itemBlock?.type === "wifi_scan_networks" || itemChecks.includes("Array")) {
        return [generator.valueToCode(block, "ADD0", ORDER_NONE) || "std::vector<int>{}", ORDER_ATOMIC];
      }
    }

    for (let i = 0; i < itemCount; i += 1) {
      const itemCode = generator.valueToCode(block, `ADD${i}`, ORDER_NONE) || "0";
      items.push(itemCode);
    }

    return [`std::vector<${listCppType}>{${items.join(", ")}}`, ORDER_ATOMIC];
  };

  generator.forBlock["lists_length"] = (block) => {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "std::vector<int>{}";
    return [`${value}.size()`, ORDER_ATOMIC];
  };

  generator.forBlock["list_var_get_index"] = (block) => {
    const variable = generator.nameDB_!.getName(
      block.getFieldValue("VAR"),
      Blockly.VARIABLE_CATEGORY_NAME
    );
    const where = block.getFieldValue("WHERE") || "FROM_START";

    let indexCode = "0";
    if (where === "FIRST") {
      indexCode = "0";
    } else if (where === "LAST") {
      indexCode = `${variable}.size() - 1`;
    } else {
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
    if (where === "FIRST") {
      indexCode = "0";
    } else if (where === "LAST") {
      indexCode = `${variable}.size() - 1`;
    } else {
      indexCode = generator.valueToCode(block, "AT", ORDER_NONE) || "0";
    }

    return `${variable}[${indexCode}] = ${valueCode};\n`;
  };
}
