import * as Blockly from "blockly";

export function getConditionBlock(block: Blockly.Block) {
  return (
    block.getInputTargetBlock("CONDITION") ||
    block.getInputTargetBlock("BOOLEAN") ||
    block.getInputTargetBlock("BOOL")
  );
}

export function getBinaryInputs(block: Blockly.Block) {
  return {
    left: block.getInputTargetBlock("A"),
    right: block.getInputTargetBlock("B"),
  };
}
