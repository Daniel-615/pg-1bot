import { describe, expect, it } from "vitest";
import type { SimulationBlock } from "../src/app/types";
import { esp32Simulator } from "../src/simulator/esp32/esp32Simulator";
import type { SimulatorInputs } from "../src/simulator/types";

const inputs: SimulatorInputs = {
  ultrasonicDistanceCm: 25,
  temperatureC: 30,
  humidityPercent: 70,
  touchValue: 18,
  analogReadValue: 1024,
  digitalReadValue: 1,
};

function block(
  type: string,
  fields: Record<string, string> = {},
  next: SimulationBlock | null = null,
  inputsByName: Record<string, SimulationBlock | null> = {}
): SimulationBlock {
  return {
    id: `${type}-${Math.random()}`,
    type,
    fields,
    inputs: inputsByName,
    next,
  };
}

describe("esp32Simulator", () => {
  it("simulates digital pins and neopixel state from blocks", () => {
    const program = block("program_start", {}, null, {
      DO: block(
        "esp32_neopixel_init",
        { PIN: "4", COUNT: "3" },
        block(
          "esp32_neopixel_set_rgb",
          { INDEX: "2", RED: "255", GREEN: "10", BLUE: "0" },
          block("esp32_digital_write", { PIN: "2", STATE: "HIGH" })
        )
      ),
    });

    const result = esp32Simulator.simulate([program], inputs);

    expect(result.neopixel).toMatchObject({
      pin: 4,
      count: 3,
      colors: ["#000000", "#FF0A00", "#000000"],
    });
    expect(result.pins).toContainEqual({
      pin: 2,
      mode: "OUTPUT",
      digital: 1,
    });
  });

  it("uses configured sensor inputs for DHT and ultrasonic expressions", () => {
    const program = block("program_start", {}, null, {
      DO: block(
        "esp32_dht_init",
        { PIN: "15", TYPE: "DHT22" },
        block(
          "print",
          {},
          block("print", {}, null, {
            TEXT: block("esp32_dht_temperature"),
          }),
          {
            TEXT: block("esp32_ultrasonic_distance", { TRIG: "12", ECHO: "14" }),
          }
        )
      ),
    });

    const result = esp32Simulator.simulate([program], inputs);

    expect(result.dht).toMatchObject({
      pin: 15,
      type: "DHT22",
      temperatureC: 30,
      humidityPercent: 70,
    });
    expect(result.ultrasonic).toMatchObject({
      trigPin: 12,
      echoPin: 14,
      distanceCm: 25,
    });
    expect(result.events).toEqual([
      { label: "Serial", detail: "25" },
      { label: "Serial", detail: "30" },
    ]);
  });

  it("simulates display and wifi blocks", () => {
    const program = block("program_start", {}, null, {
      DO: block(
        "wifi_connect",
        { SSID: "Aula", PASSWORD: "12345678" },
        block(
          "esp32_display_init",
          { SDA: "21", SCL: "22" },
          block("esp32_display_print", { X: "0", Y: "0" }, null, {
            TEXT: block("wifi_local_ip"),
          })
        )
      ),
    });

    const result = esp32Simulator.simulate([program], inputs);

    expect(result.wifi).toMatchObject({
      mode: "station",
      connected: true,
      ssid: "Aula",
      ipAddress: "192.168.1.42",
    });
    expect(result.display).toMatchObject({
      sdaPin: 21,
      sclPin: 22,
      lines: ["192.168.1.42    ", ""],
    });
    expect(result.capabilities.display).toBe(true);
    expect(result.capabilities.wifi).toBe(true);
  });
});
