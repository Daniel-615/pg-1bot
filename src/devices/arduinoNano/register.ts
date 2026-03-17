import type { Board } from "../../boards/Board";
import { ArduinoNanoGenerator } from "./generator";

export class ArduinoNanoBoard implements Board<ArduinoNanoGenerator> {
  type = "nano";

  getGenerator(): ArduinoNanoGenerator {
    return new ArduinoNanoGenerator();
  }
}