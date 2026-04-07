import { defineEsp32DisplayBlocks } from "./display/display";
import { defineEsp32LightBlocks } from "./lights/lights";
import { defineEsp32PinBlocks } from "./pins/pins";
import { defineEsp32SensorBlocks } from "./sensors/sensors";
import { defineEsp32WifiBlocks } from "./wifi/wifi";

export function defineEsp32Blocks() {
  defineEsp32DisplayBlocks();
  defineEsp32LightBlocks();
  defineEsp32PinBlocks();
  defineEsp32SensorBlocks();
  defineEsp32WifiBlocks();
}

export const defineESP32Blocks = defineEsp32Blocks;
