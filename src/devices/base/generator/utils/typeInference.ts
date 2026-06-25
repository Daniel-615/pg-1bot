import type * as Blockly from "blockly";

export function inferExpressionChecks(block: Blockly.Block | null) {
  return block?.outputConnection?.getCheck() ?? [];
}

export function inferListCppType(block: Blockly.Block | null) {
  if (!block) {
    return "int";
  }

  if (block.type === "wifi_scan_networks") {
    return "String";
  }

  if (block.type !== "lists_create_with") {
    return "int";
  }

  const listBlock = block as Blockly.Block & { itemCount_?: number };
  const itemCount = listBlock.itemCount_ ?? 0;

  for (let i = 0; i < itemCount; i += 1) {
    const itemBlock = block.getInputTargetBlock(`ADD${i}`);
    const checks = inferExpressionChecks(itemBlock);

    if (
      itemBlock?.type === "wifi_scan_networks" ||
      itemBlock?.type === "string" ||
      itemBlock?.type === "json_object" ||
      checks.includes("String")
    ) {
      return "String";
    }
  }

  for (let i = 0; i < itemCount; i += 1) {
    const itemBlock = block.getInputTargetBlock(`ADD${i}`);
    const checks = inferExpressionChecks(itemBlock);

    if (
      itemBlock?.type === "logic_boolean" ||
      checks.includes("Boolean")
    ) {
      return "bool";
    }
  }

  return "int";
}
