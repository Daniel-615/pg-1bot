import type { Board } from "../../boards/Board";
import { ESP32Generator } from "./generator/generator";
import { defineESP32Blocks } from "./blocks/blocks";

let esp32BlocksRegistered = false;

export class ESP32Board implements Board<ESP32Generator> {
  type = "esp32";

  getGenerator(): ESP32Generator {
    return new ESP32Generator();
  }

  registerBlocks() {
    if (esp32BlocksRegistered) {
      return;
    }

    defineESP32Blocks();
    esp32BlocksRegistered = true;
  }
}
