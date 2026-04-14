import * as Blockly from "blockly";

export type CodeyBlockDefinition = Parameters<typeof Blockly.defineBlocksWithJsonArray>[0][number];
