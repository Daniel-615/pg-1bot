import { getEsp32DisplayCategories } from "./esp32DisplayCategories";
import { getEsp32LightCategories } from "./esp32LightCategories";
import { getEsp32PinCategories } from "./esp32PinCategories";
import { getEsp32SensorCategories } from "./esp32SensorCategories";
import { getEsp32WifiCategories } from "./esp32WifiCategories";

export function getEsp32Categories(extraCategories: any[] = []) {
  return [
    ...getEsp32PinCategories(),
    ...getEsp32LightCategories(),
    ...getEsp32WifiCategories(),
    ...getEsp32SensorCategories(),
    ...getEsp32DisplayCategories(),
    ...extraCategories,
  ];
}
