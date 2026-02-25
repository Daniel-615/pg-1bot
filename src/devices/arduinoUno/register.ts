import { defineArduinoBlocks } from "./blocks";
import { defineArduinoGenerator } from "./generator";

export function registerArduinoUno() {
  defineArduinoBlocks();
  defineArduinoGenerator();
}