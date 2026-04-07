import type { Board } from "../../boards/Board";
import { ArduinoUnoBoard } from "../arduinoUno/register";
import { ArduinoMegaGenerator } from "./generator";

export class ArduinoMegaBoard extends ArduinoUnoBoard implements Board<ArduinoMegaGenerator> {
  type = "mega";

  getGenerator(): ArduinoMegaGenerator {
    return new ArduinoMegaGenerator();
  }
}