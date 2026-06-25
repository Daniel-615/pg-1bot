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
  it("configura pinMode explicito en setup", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_pin_mode"](
      createBlockMock({ PIN: "4", MODE: "INPUT_PULLUP" }) as never,
      generator as never
    );

    expect(result).toBe("");
    expect(Array.from(generator.setupDefinitions)).toContain("pinMode(4, INPUT_PULLUP);");
  });

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

  it("genera PWM usando el API actual de LEDC por pin", () => {
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

    expect(result).toBe("ledcWrite(22, 200);\n");
    expect(Array.from(generator.setupDefinitions)).toContain("ledcAttach(22, 1000, 8);");
  });

  it("genera PWM para pines distintos sin usar canales LEDC manuales", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const firstPin = generator.forBlock["esp32_pwm_write"](
      createBlockMock({
        PIN: "22",
        FREQUENCY: "1000",
        DUTY: "200",
      }) as never,
      generator as never
    );

    const secondPin = generator.forBlock["esp32_pwm_write"](
      createBlockMock({
        PIN: "23",
        FREQUENCY: "1000",
        DUTY: "100",
      }) as never,
      generator as never
    );

    const sameFirstPin = generator.forBlock["esp32_pwm_write"](
      createBlockMock({
        PIN: "22",
        FREQUENCY: "500",
        DUTY: "50",
      }) as never,
      generator as never
    );

    expect(firstPin).toBe("ledcWrite(22, 200);\n");
    expect(secondPin).toBe("ledcWrite(23, 100);\n");
    expect(sameFirstPin).toBe("ledcWrite(22, 50);\n");

    const setupCode = Array.from(generator.setupDefinitions).join("\n");
    expect(setupCode).toContain("ledcAttach(22, 1000, 8);");
    expect(setupCode).toContain("ledcAttach(23, 1000, 8);");
    expect(setupCode).toContain("ledcAttach(22, 500, 8);");
  });

  it("genera salida analoga friendly usando PWM", () => {
    const generator = new ESP32Generator();
    registerESP32PinGenerator(generator);

    const result = generator.forBlock["esp32_analog_write"](
      createBlockMock({ PIN: "21", VALUE: "64" }) as never,
      generator as never
    );

    expect(result).toBe("ledcWrite(21, 64);\n");
    expect(Array.from(generator.setupDefinitions)).toContain("ledcAttach(21, 5000, 8);");
  });
});
