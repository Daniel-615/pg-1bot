import { describe, expect, it } from "vitest";
import { registerOperatorsLogicGenerator } from "../src/devices/base/generator/operators/operatorsLogic";

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

describe("registerOperatorsLogicGenerator", () => {
  it("genera un booleano en minúsculas", () => {
    const generator = createGeneratorMock();
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock({ BOOL: "TRUE" });
    const result = generator.forBlock.logic_boolean(block);

    expect(result).toEqual(["true", 0]);
  });

  it("genera una comparación AND", () => {
    const generator = createGeneratorMock({
      A: "sensorActivo",
      B: "modoManual",
    });
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_and(block);

    expect(result).toEqual(["sensorActivo && modoManual", 0]);
  });

  it("usa el valor por defecto en NOT cuando falta la entrada", () => {
    const generator = createGeneratorMock();
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_not(block);

    expect(result).toEqual(["!false", 0]);
  });

  it("usa valores por defecto en OR cuando faltan ambas entradas", () => {
    const generator = createGeneratorMock();
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_or(block);

    expect(result).toEqual(["false || false", 0]);
  });

  it("genera una comparación mayor que", () => {
    const generator = createGeneratorMock({
      A: "temperatura",
      B: "umbral",
    });
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_greater(block);

    expect(result).toEqual(["temperatura > umbral", 0]);
  });

  it("genera una comparación menor que con fallback numérico", () => {
    const generator = createGeneratorMock({
      A: "lectura",
    });
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_less(block);

    expect(result).toEqual(["lectura < 0", 0]);
  });

  it("genera igualdad con el nombre de bloque registrado", () => {
    const generator = createGeneratorMock({
      A: "x",
      B: "y",
    });
    registerOperatorsLogicGenerator(generator as never);

    const block = createBlockMock();
    const result = generator.forBlock.logic_equal(block);

    expect(result).toEqual(["x == y", 0]);
  });
});
