import { describe, expect, it } from "vitest";
import { ESP32Generator } from "../src/devices/esp32/generator/generator";
import { registerESP32PinGenerator } from "../src/devices/esp32/generator/pins/pinsGenerator";

type MockBlock = {
  getFieldValue: (name: string) => string;
};

function createBlockMock(fields: Record<string, string> = {}): MockBlock {
  return {
    getFieldValue: (name: string) => fields[name] ?? "",
  };
}

describe("registerESP32PinGenerator", () => {
  it("genera escritura digital y registra el pin como salida", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_digital_write"](
      createBlockMock({ PIN: "2", STATE: "HIGH" }) as never,
      generator as never
    );

    expect(result).toBe("digitalWrite(2, HIGH);\n");
    expect(Array.from(generator.setupDefinitions)).toContain("pinMode(2, OUTPUT);");
  });

  it("genera lectura digital y registra el pin como entrada", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_digital_read"](
      createBlockMock({ PIN: "13" }) as never,
      generator as never
    );

    expect(result).toEqual(["digitalRead(13)", 0]);
    expect(Array.from(generator.setupDefinitions)).toContain("pinMode(13, INPUT);");
  });

  it("genera lectura analogica del pin seleccionado", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_analog_read"](
      createBlockMock({ PIN: "32" }) as never,
      generator as never
    );

    expect(result).toEqual(["analogRead(32)", 0]);
  });

  it("genera PWM con configuracion de canal derivada del pin", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_pwm_write"](
      createBlockMock({
        PIN: "22",
        FREQUENCY: "1000",
        DUTY: "200",
      }) as never,
      generator as never
    );

    expect(result).toBe("ledcWrite(6, 200);\n");
    expect(Array.from(generator.setupDefinitions).join("\n")).toContain("ledcSetup(6, 1000, 8);");
    expect(Array.from(generator.setupDefinitions).join("\n")).toContain("ledcAttachPin(22, 6);");
  });
});
