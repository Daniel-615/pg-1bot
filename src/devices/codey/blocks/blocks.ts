import * as Blockly from "blockly";
import { codeyBlockGroups } from "./registry";

export function defineCodeyBlocks() {
  Blockly.defineBlocksWithJsonArray(codeyBlockGroups.flat());
}
