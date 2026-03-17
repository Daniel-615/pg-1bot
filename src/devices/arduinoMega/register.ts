import type { Board } from "../../boards/Board";
import { ArduinoMegaGenerator } from "./generator";

export class ArduinoMegaBoard implements Board<ArduinoMegaGenerator> {
  type = "mega";

  getGenerator(): ArduinoMegaGenerator {
    return new ArduinoMegaGenerator();
  }
}