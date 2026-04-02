import { describe, expect, it, vi } from "vitest";
import { ESP32Generator } from "../src/devices/esp32/generator/generator";
import { registerESP32LightGenerator } from "../src/devices/esp32/generator/lights/lightsGenerator";
import { registerESP32SensorGenerator } from "../src/devices/esp32/generator/sensors/sensorsGenerator";
import { registerESP32DisplayGenerator } from "../src/devices/esp32/generator/display/displayGenerator";
import { registerESP32WifiGenerator } from "../src/devices/esp32/generator/wifi/wifiGenerator";

type MockBlock = {
  getFieldValue: (name: string) => string;
};

function createBlockMock(fields: Record<string, string> = {}): MockBlock {
  return {
    getFieldValue: (name: string) => fields[name] ?? "",
  };
}

describe("ESP32 extra generators", () => {
  it("genera inicializacion de neopixel con include y setup", () => {
    const generator = new ESP32Generator();
    registerESP32LightGenerator(generator);

    const result = generator.forBlock["esp32_neopixel_init"](
      createBlockMock({ PIN: "4", COUNT: "5" }) as never,
      generator as never
    );

    expect(result).toBe("");
    expect(Array.from(generator.includes)).toContain("#include <Adafruit_NeoPixel.h>");
    expect(Array.from(generator.globalDefinitions).join("\n")).toContain(
      "Adafruit_NeoPixel _1botEsp32Strip(5, 4, NEO_GRB + NEO_KHZ800);"
    );
  });

  it("convierte color hexadecimal para neopixel", () => {
    const generator = new ESP32Generator();
    registerESP32LightGenerator(generator);

    const result = generator.forBlock["esp32_neopixel_color"](
      createBlockMock({ COLOR: "#12abef" }) as never,
      generator as never
    );

    expect(result).toEqual(["0x12ABEF", 0]);
  });

  it("genera lectura touch", () => {
    const generator = new ESP32Generator();
    registerESP32SensorGenerator(generator);

    const result = generator.forBlock["esp32_touch_read"](
      createBlockMock({ PIN: "13" }) as never,
      generator as never
    );

    expect(result).toEqual(["touchRead(13)", 0]);
  });

  it("genera distancia ultrasonica y configura pines", () => {
    const generator = new ESP32Generator();
    registerESP32SensorGenerator(generator);

    const result = generator.forBlock["esp32_ultrasonic_distance"](
      createBlockMock({ TRIG: "2", ECHO: "5" }) as never,
      generator as never
    );

    expect(result).toEqual([
      "({ digitalWrite(2, LOW); delayMicroseconds(2); digitalWrite(2, HIGH); delayMicroseconds(10); digitalWrite(2, LOW); pulseIn(5, HIGH, 30000UL) * 0.0343 / 2; })",
      0,
    ]);
    expect(Array.from(generator.setupDefinitions)).toContain("pinMode(2, OUTPUT);");
    expect(Array.from(generator.setupDefinitions)).toContain("pinMode(5, INPUT);");
  });

  it("genera impresion en display con el texto conectado", () => {
    const generator = new ESP32Generator();
    registerESP32DisplayGenerator(generator);
    generator.valueToCode = vi.fn(() => "\"ESP32\"") as never;

    const result = generator.forBlock["esp32_display_print"](
      createBlockMock({ X: "1", Y: "1" }) as never,
      generator as never
    );

    expect(result).toBe("_1botEsp32Display.setCursor(1, 1);\n_1botEsp32Display.print(\"ESP32\");\n");
  });

  it("genera desconexion wifi con terminador correcto", () => {
    const generator = new ESP32Generator();
    registerESP32WifiGenerator(generator);

    const result = generator.forBlock["wifi_disconnect"](
      createBlockMock() as never,
      generator as never
    );

    expect(result).toBe("WiFi.disconnect();\n");
    expect(Array.from(generator.includes)).toContain("#include <WiFi.h>");
  });

  it("genera escaneo wifi usando la clase correcta", () => {
    const generator = new ESP32Generator();
    registerESP32WifiGenerator(generator);

    const result = generator.forBlock["wifi_scan_networks"](
      createBlockMock() as never,
      generator as never
    );

    expect(result).toEqual(["WiFi.scanNetworks()", 0]);
  });
});
