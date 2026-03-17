import type { Board } from "./Board";
import { ArduinoUnoBoard } from "../devices/arduinoUno/register";
import { ESP32Board } from "../devices/esp32/register";
import { ArduinoMegaBoard } from "../devices/arduinoMega/register";
import { ArduinoNanoBoard } from "../devices/arduinoNano/register";
import { CodeyBoard } from "../devices/codey/register";

export class BoardFactory {
  static create(type: string): Board {
    switch (type) {
      case "uno":
        return new ArduinoUnoBoard();
      case "mega":
        return new ArduinoMegaBoard();
      case "nano":
        return new ArduinoNanoBoard();
      case "codey":
        return new CodeyBoard();
      case "esp32":
        return new ESP32Board();

      default:
        throw new Error(`Board "${type}" not supported`);
    }
  }
}