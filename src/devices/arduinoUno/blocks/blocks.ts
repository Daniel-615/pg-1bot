import { defineArduinoUnoPinBlocks } from "./pins/pins";
import { defineArduinoUnoSerialBlocks } from "./serial/serial";
import { defineArduinoUnoDataBlocks } from "./data/data";
import { defineArduinoUnoSensorBlocks } from "./sensors/sensors";

export function defineArduinoUnoBlocks() {
  defineArduinoUnoPinBlocks();
  defineArduinoUnoSerialBlocks();
  defineArduinoUnoDataBlocks();
  defineArduinoUnoSensorBlocks();
}
