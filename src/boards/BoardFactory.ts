import type { Board } from "./Board";

export class BoardFactory {
  static async create(type: string): Promise<Board> {
    switch (type) {
      case "uno": {
        const { ArduinoUnoBoard } = await import("../devices/arduinoUno/register");
        return new ArduinoUnoBoard();
      }
      case "mega": {
        const { ArduinoMegaBoard } = await import("../devices/arduinoMega/register");
        return new ArduinoMegaBoard();
      }
      case "nano": {
        const { ArduinoNanoBoard } = await import("../devices/arduinoNano/register");
        return new ArduinoNanoBoard();
      }
      case "codey": {
        const { CodeyBoard } = await import("../devices/codey/register");
        return new CodeyBoard();
      }
      case "esp32": {
        const { ESP32Board } = await import("../devices/esp32/register");
        return new ESP32Board();
      }
      default:
        throw new Error(`Board "${type}" not supported`);
    }
  }
}
