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

  it("genera inicializacion y lectura de DHT", () => {
    const generator = new ESP32Generator();
    registerESP32SensorGenerator(generator);

    const initResult = generator.forBlock["esp32_dht_init"](
      createBlockMock({ PIN: "4", TYPE: "DHT22" }) as never,
      generator as never
    );
    const tempResult = generator.forBlock["esp32_dht_temperature"](
      createBlockMock() as never,
      generator as never
    );

    expect(initResult).toBe("");
    expect(tempResult).toEqual(["_1botEsp32Dht.readTemperature()", 0]);
    expect(Array.from(generator.includes)).toContain("#include <DHT.h>");
    expect(Array.from(generator.globalDefinitions).join("\n")).toContain("DHT _1botEsp32Dht(4, DHT22);");
  });

  it("genera attach y movimiento de servo", () => {
    const generator = new ESP32Generator();
    registerESP32SensorGenerator(generator);

    const attachResult = generator.forBlock["esp32_servo_attach"](
      createBlockMock({ PIN: "18" }) as never,
      generator as never
    );
    const writeResult = generator.forBlock["esp32_servo_write"](
      createBlockMock({ PIN: "18", ANGLE: "90" }) as never,
      generator as never
    );

    expect(attachResult).toBe("");
    expect(writeResult).toBe("_1botServo_18.write(90);\n");
    expect(Array.from(generator.includes)).toContain("#include <ESP32Servo.h>");
    expect(Array.from(generator.setupDefinitions)).toContain("_1botServo_18.attach(18);");
  });

  it("genera tono de buzzer con ledcWriteTone", () => {
    const generator = new ESP32Generator();
    registerESP32SensorGenerator(generator);

    const result = generator.forBlock["esp32_tone_play"](
      createBlockMock({ PIN: "25", FREQUENCY: "440", DURATION: "200" }) as never,
      generator as never
    );

    expect(result).toContain("ledcWriteTone(0, 440);");
    expect(result).toContain("delay(200);");
    expect(result).toContain("ledcWriteTone(0, 0);");
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

    expect(result).toBe("WiFi.disconnect(true);\nWiFi.softAPdisconnect(true);\nWiFi.mode(WIFI_OFF);\n");
    expect(Array.from(generator.includes)).toContain("#include <WiFi.h>");
  });

  it("genera escaneo wifi devolviendo una lista de SSID", () => {
    const generator = new ESP32Generator();
    registerESP32WifiGenerator(generator);

    const result = generator.forBlock["wifi_scan_networks"](
      createBlockMock() as never,
      generator as never
    );

    expect(result).toEqual([
      `([]() {
        std::vector<String> _1botNetworks;
        int _1botNetworkCount = WiFi.scanNetworks();
        for (int _1botIndex = 0; _1botIndex < _1botNetworkCount; ++_1botIndex) {
          _1botNetworks.push_back(WiFi.SSID(_1botIndex));
        }
        WiFi.scanDelete();
        return _1botNetworks;
      })()`,
      0,
    ]);
    expect(Array.from(generator.includes)).toContain("#include <vector>");
  });

  it("captura la ruta real solicitada en el servidor web", () => {
    const generator = new ESP32Generator();
    registerESP32WifiGenerator(generator);
    generator.valueToCode = vi.fn(() => "\"ok\"") as never;

    generator.forBlock["wifi_start_web_server"](
      createBlockMock({ PORT: "80", PATH: "/" }) as never,
      generator as never
    );

    const setupCode = Array.from(generator.setupDefinitions).join("\n");
    expect(setupCode).toContain("_1botLastWebPath = _1botWebServer.uri();");
    expect(setupCode).toContain("_1botWebServer.onNotFound");
  });

  it("genera peticiones HTTP GET y POST", () => {
    const generator = new ESP32Generator();
    registerESP32WifiGenerator(generator);
    generator.valueToCode = vi
      .fn()
      .mockReturnValueOnce("\"https://example.com\"")
      .mockReturnValueOnce("\"https://example.com/post\"")
      .mockReturnValueOnce("\"application/json\"")
      .mockReturnValueOnce("\"{\\\"ok\\\":true}\"") as never;

    const getResult = generator.forBlock["wifi_http_get_text"](
      createBlockMock() as never,
      generator as never
    );
    const postResult = generator.forBlock["wifi_http_post_text"](
      createBlockMock() as never,
      generator as never
    );

    expect(getResult[0]).toContain("HTTPClient _1botHttp;");
    expect(getResult[0]).toContain("_1botHttp.GET()");
    expect(postResult[0]).toContain("_1botHttp.addHeader(\"Content-Type\", \"application/json\")");
    expect(postResult[0]).toContain("_1botHttp.POST(\"{\\\"ok\\\":true}\")");
    expect(Array.from(generator.includes)).toContain("#include <HTTPClient.h>");
  });
});
