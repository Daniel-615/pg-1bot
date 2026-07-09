import { describe, expect, it } from "vitest";
import { createWokwiProjectFiles } from "../src/screens/simulator/wokwi";

describe("Wokwi project files", () => {
  it("keeps the generated code as sketch.ino content", () => {
    const code = "void setup() {}\nvoid loop() {}";
    const files = createWokwiProjectFiles({ board: "uno", code });

    expect(files.sketch).toBe(code);
  });

  it("generates LED wiring from output pin code", () => {
    const files = createWokwiProjectFiles({
      board: "uno",
      code: "void setup(){ pinMode(13, OUTPUT); } void loop(){ digitalWrite(13, HIGH); }",
    });

    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "led_13", type: "wokwi-led" })
    );
    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "res_13", type: "wokwi-resistor" })
    );
    expect(files.diagram.connections).toContainEqual(["uno:13", "res_13:1", "green", []]);
  });

  it("generates servo and buzzer wiring from generated APIs", () => {
    const files = createWokwiProjectFiles({
      board: "uno",
      code: `
        Servo _1botServo_9;
        void setup(){ _1botServo_9.attach(9); }
        void loop(){ _1botServo_9.write(90); tone(8, 440, 200); }
      `,
    });

    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "servo_9", type: "wokwi-servo" })
    );
    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "buzzer_8", type: "wokwi-buzzer" })
    );
    expect(files.diagram.connections).toContainEqual(["uno:9", "servo_9:PWM", "green", []]);
    expect(files.diagram.connections).toContainEqual(["uno:8", "buzzer_8:2", "green", []]);
  });

  it("generates ESP32 sensor wiring", () => {
    const files = createWokwiProjectFiles({
      board: "esp32",
      code: `
        DHT _1botEsp32Dht(4, DHT22);
        Adafruit_NeoPixel _1botEsp32Strip(2, 18, NEO_GRB + NEO_KHZ800);
        void setup(){ pinMode(2, OUTPUT); pinMode(5, INPUT); }
        void loop(){ digitalWrite(2, HIGH); pulseIn(5, HIGH, 30000UL); }
      `,
    });

    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "dht_4", type: "wokwi-dht22" })
    );
    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "ultra_2_5", type: "wokwi-hc-sr04" })
    );
    expect(files.diagram.parts).toContainEqual(
      expect.objectContaining({ id: "neo_18_1", type: "wokwi-neopixel" })
    );
    expect(files.diagram.connections).toContainEqual(["esp:4", "dht_4:SDA", "green", []]);
    expect(files.diagram.connections).toContainEqual(["esp:2", "ultra_2_5:TRIG", "green", []]);
    expect(files.diagram.connections).toContainEqual(["esp:18", "neo_18_1:DIN", "green", []]);
  });
});
