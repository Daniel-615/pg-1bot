import { describe, expect, it } from "vitest";
import { extensionTemplates } from "../src/screens/extensions/extensionBuilderTemplates";

describe("extension builder templates", () => {
  it("incluye las plantillas funcionales esperadas", () => {
    expect(extensionTemplates.map((template) => template.id)).toEqual(["digital-write", "analog-read", "tone"]);
  });

  it("usa código Arduino ejecutable y parámetros declarados", () => {
    const digital = extensionTemplates.find((template) => template.id === "digital-write");
    const analog = extensionTemplates.find((template) => template.id === "analog-read");
    const tone = extensionTemplates.find((template) => template.id === "tone");

    expect(digital?.code).toContain("digitalWrite");
    expect(digital?.parameters.map((parameter) => parameter.nombre)).toEqual(["pin", "state"]);
    expect(analog?.code).toContain("analogRead");
    expect(tone?.code).toContain("tone");
  });
});
