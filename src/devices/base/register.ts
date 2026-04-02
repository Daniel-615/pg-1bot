import { defineArduinoBlocks } from "./blocks/blocks";

let baseBlocksRegistered = false;

export function registerBaseBlocks() {
  if (baseBlocksRegistered) {
    return;
  }

  defineArduinoBlocks();
  baseBlocksRegistered = true;
}

export function registerArduinoUno() {
  registerBaseBlocks();
}
