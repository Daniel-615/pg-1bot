import type { Board } from "../../boards/Board";
import { defineArduinoBlocks } from "../base/blocks/blocks";
import { defineArduinoUnoBlocks } from "./blocks/blocks";
import { ArduinoUnoGenerator } from "./generator";
let arduinoUnoBlocksRegistered = false;
export class ArduinoUnoBoard implements Board<ArduinoUnoGenerator> {
  type = "uno";

  getGenerator(): ArduinoUnoGenerator {
    return new ArduinoUnoGenerator();
  }
  registerBlocks() {
    if(arduinoUnoBlocksRegistered){
      return;
    }
    defineArduinoBlocks();
    defineArduinoUnoBlocks();
    arduinoUnoBlocksRegistered =true;
  }
}
