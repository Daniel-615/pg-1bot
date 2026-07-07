import { defineArduinoBlocks } from "./blocks/blocks";
import { defineBackgroundBlocks } from "../../backgrounds/blocks";

let baseBlocksRegistered = false;

export function registerBaseBlocks() {
  if (baseBlocksRegistered) {
    return;
  }

  defineArduinoBlocks();
  defineBackgroundBlocks();
  baseBlocksRegistered = true;
}

export function registerArduinoUno() {
  registerBaseBlocks();
}
