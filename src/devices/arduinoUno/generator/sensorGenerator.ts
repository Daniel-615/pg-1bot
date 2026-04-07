import type { ArduinoUnoGenerator } from "../generator";

const ORDER_ATOMIC = 0;

export function registerSensorGenerators(generator: ArduinoUnoGenerator) {
  generator.forBlock["arduino_uno_temporizador"] = () => {
    generator.addGlobalDefinition("unsigned long _1botTimer = 0;", "uno_timer");
    return ["(millis() - _1botTimer)", ORDER_ATOMIC];
  };

  generator.forBlock["arduino_uno_reiniciar_temporizador"] = () => {
    generator.addGlobalDefinition("unsigned long _1botTimer = 0;", "uno_timer");
    return "_1botTimer = millis();\n";
  };

  generator.forBlock["arduino_uno_sensor_ultrasonico"] = (block) => {
    const trig = block.getFieldValue("TRIG") || "3";
    const echo = block.getFieldValue("ECHO") || "2";
    return [
      `([]() {
        pinMode(${trig}, OUTPUT);
        pinMode(${echo}, INPUT);
        digitalWrite(${trig}, LOW);
        delayMicroseconds(2);
        digitalWrite(${trig}, HIGH);
        delayMicroseconds(10);
        digitalWrite(${trig}, LOW);
        return pulseIn(${echo}, HIGH, 30000UL) * 0.0343 / 2;
      })()`,
      ORDER_ATOMIC,
    ];
  };
}
