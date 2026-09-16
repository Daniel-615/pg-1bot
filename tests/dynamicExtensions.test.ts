import { describe, expect, it } from "vitest";
import { interpolate, parseLibraries } from "../src/screens/extensions/dynamicExtensions";

describe("dynamic extension helpers", () => {
  it("parsea bibliotecas JSON, separadas por línea y por coma", () => {
    expect(parseLibraries('["Wire.h", "Servo.h"]')).toEqual(["Wire.h", "Servo.h"]);
    expect(parseLibraries("Wire.h\nServo.h, EEPROM.h")).toEqual(["Wire.h", "Servo.h", "EEPROM.h"]);
    expect(parseLibraries(undefined)).toEqual([]);
  });

  it("interpela nombres y posiciones de parámetros", () => {
    expect(interpolate("digitalWrite({{pin}}, %state%);", { pin: "13", state: "HIGH" }, ["13", "HIGH"])).toBe("digitalWrite(13, HIGH);");
    expect(interpolate("tone(%1, %2);", {}, ["8", "440"])).toBe("tone(8, 440);");
  });

  it("deja vacíos los parámetros que no fueron proporcionados", () => {
    expect(interpolate("read({{sensor}})", {}, [])).toBe("read()");
  });
});
