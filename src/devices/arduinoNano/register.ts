import type { Board } from "../../boards/Board";
import { ArduinoUnoBoard } from "../arduinoUno/register";
import { ArduinoNanoGenerator } from "./generator";

export class ArduinoNanoBoard extends ArduinoUnoBoard implements Board<ArduinoNanoGenerator> {
  type = "nano";

  getGenerator(): ArduinoNanoGenerator {
    return new ArduinoNanoGenerator();
  }
}
