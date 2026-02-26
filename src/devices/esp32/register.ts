import type { Board } from "../../boards/Board";

import { ESP32Generator } from "../esp32/generator";

export class ESP32Board implements Board<ESP32Generator> {
    type="esp32";

    getGenerator(): ESP32Generator {
        return new ESP32Generator();
    }
}