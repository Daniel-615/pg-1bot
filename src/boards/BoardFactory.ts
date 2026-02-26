import type { Board } from "./Board";
import { ArduinoUnoBoard } from "../devices/arduinoUno/register";
import { ESP32Board } from "../devices/esp32/register";

export class BoardFactory {
  static create(type: string): Board {
    switch (type) {
      case "uno":
        return new ArduinoUnoBoard();

      case "esp32":
        return new ESP32Board();

      default:
        throw new Error(`Board "${type}" not supported`);
    }
  }
}