import type { Board } from "../../boards/Board";
import { ESP32Generator } from "./generator/generator";
import { defineESP32Blocks } from "./blocks/blocks";

export class ESP32Board implements Board<ESP32Generator> {
  type = "esp32";

  getGenerator(): ESP32Generator {
    return new ESP32Generator();
  }

  registerBlocks() {
    defineESP32Blocks();
  }
}