import type { Board } from "../../boards/Board";
import { ArduinoUnoGenerator } from "./generator";

export class ArduinoUnoBoard implements Board<ArduinoUnoGenerator> {
  type = "uno";

  getGenerator(): ArduinoUnoGenerator {
    return new ArduinoUnoGenerator();
  }
}