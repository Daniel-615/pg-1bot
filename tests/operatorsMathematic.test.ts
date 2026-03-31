import { describe, expect, it } from "vitest";
import { registerOperatorsMathematicsGenerator } from "../src/devices/base/generator/operators/operatorsMathematic";

type MockBlock = {
  getFieldValue: (name: string) => string;
};

function createGeneratorMock(values: Record<string, string> = {}) {
  return {
    forBlock: {} as Record<string, (block: MockBlock) => unknown>,
    valueToCode: (_block: MockBlock, inputName: string) => values[inputName] ?? "",
  };
}

function createBlockMock(fields: Record<string, string> = {}): MockBlock {
  return {
    getFieldValue: (name: string) => fields[name] ?? "",
  };
}

describe("registerOperatorsMathematicsGenerator", () => {
  it("genera suma usando valores por defecto cuando faltan las entradas", () => {
    const generator = createGeneratorMock();
    registerOperatorsMathematicsGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock["math_add"](block);

    expect(result).toEqual(["0 + 0", 0]);
  });

  it("genera resta con valores existentes", () => {
    const generator = createGeneratorMock({ A: "x", B: "y" });
    registerOperatorsMathematicsGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock["math_subtract"](block);

    expect(result).toEqual(["x - y", 0]);
  });

  it("genera división con fallback sobre entrada vacía", () => {
    const generator = createGeneratorMock({ A: "numerador" });
    registerOperatorsMathematicsGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock["math_divide"](block);

    expect(result).toEqual(["numerador / 0", 0]);
  });

  it("genera random con valores por defecto si no se proveen los parámetros", () => {
    const generator = createGeneratorMock();
    registerOperatorsMathematicsGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock["math_random"](block);

    expect(result).toEqual(["random(0, 10)", 0]);
  });
});
