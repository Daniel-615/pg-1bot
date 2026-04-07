import { getArduinoUnoDataCategories } from "./unoDataCategories";
import { getArduinoUnoPinCategories } from "./unoPinCategories";
import { getArduinoUnoSensorCategories } from "./unoSensorCategories";
import { getArduinoUnoSerialCategories } from "./unoSerialCategories";

export function getArduinoUnoCategories(extraCategories: any[] = []) {
  return [
    ...getArduinoUnoPinCategories(),
    ...getArduinoUnoSerialCategories(),
    ...getArduinoUnoDataCategories(),
    ...getArduinoUnoSensorCategories(),
    ...extraCategories,
  ];
}
