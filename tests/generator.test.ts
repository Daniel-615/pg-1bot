import { describe, expect, it, vi } from "vitest";
import { ArduinoBaseGenerator } from "../src/devices/base/generator/generator";

type MockBlock = {
  getFieldValue: (name: string) => string;
  nextConnection?: {
    targetBlock: () => MockBlock | null;
  };
  itemCount_?: number;
};

function createBlockMock(fields: Record<string, string> = {}): MockBlock {
  return {
    getFieldValue: (name: string) => fields[name] ?? "",
  };
}

describe("ArduinoBaseGenerator", () => {
  it("reinicia includes, globals y setup en init", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const reset = vi.fn();
    const setVariableMap = vi.fn();

    generator.addInclude("#include <vector>");
    generator.addGlobalDefinition("int sensor = 0;");
    generator.addSetupDefinition("pinMode(13, OUTPUT);");
    generator.nameDB_ = {
      reset,
      setVariableMap,
    } as never;

    const workspace = {
      getVariableMap: vi.fn(() => "variable-map"),
    };

    generator.init(workspace as never);

    expect(Array.from(generator.includes)).toEqual([]);
    expect(Array.from(generator.globalDefinitions)).toEqual([]);
    expect(Array.from(generator.setupDefinitions)).toEqual([]);
    expect(reset).toHaveBeenCalled();
    expect(setVariableMap).toHaveBeenCalledWith("variable-map");
  });

  it("concatena el siguiente bloque en scrub_", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const nextBlock = createBlockMock();
    const block = {
      ...createBlockMock(),
      nextConnection: {
        targetBlock: () => nextBlock,
      },
    };

    generator.blockToCode = vi.fn(() => "Serial.println(\"next\");\n") as never;

    const result = generator.scrub_(block as never, "Serial.println(\"current\");\n");

    expect(result).toBe("Serial.println(\"current\");\nSerial.println(\"next\");\n");
  });

  it("genera una lista vacia e incluye vector", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const block = createBlockMock();

    const result = generator.forBlock["lists_create_empty"](block as never, generator as never);

    expect(result).toEqual(["std::vector<int>{}", 0]);
    expect(Array.from(generator.includes)).toContain("#include <vector>");
  });

  it("genera una lista con los items configurados y fallback en entradas vacias", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const block = {
      ...createBlockMock(),
      itemCount_: 3,
    };

    generator.valueToCode = vi
      .fn((_block, inputName) => {
        const values: Record<string, string> = {
          ADD0: "1",
          ADD1: "",
          ADD2: "sensor",
        };

        return values[inputName] ?? "";
      }) as never;

    const result = generator.forBlock["lists_create_with"](block as never, generator as never);

    expect(result).toEqual(["std::vector<int>{1, 0, sensor}", 0]);
    expect(Array.from(generator.includes)).toContain("#include <vector>");
  });

  it("genera size() para lists_length con fallback de lista vacia", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const block = createBlockMock();

    generator.valueToCode = vi.fn(() => "") as never;

    const result = generator.forBlock["lists_length"](block as never, generator as never);

    expect(result).toEqual(["std::vector<int>{}.size()", 0]);
  });

  it("obtiene un elemento de lista por ultimo indice", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const block = createBlockMock({
      VAR: "items",
      WHERE: "LAST",
    });

    generator.nameDB_ = {
      getName: vi.fn(() => "items"),
    } as never;

    const result = generator.forBlock["list_var_get_index"](block as never, generator as never);

    expect(result).toEqual(["items[items.size() - 1]", 0]);
  });

  it("asigna un elemento de lista por indice personalizado", () => {
    const generator = new ArduinoBaseGenerator("Arduino");
    const block = createBlockMock({
      VAR: "numeros",
      WHERE: "FROM_START",
    });

    generator.nameDB_ = {
      getName: vi.fn(() => "numeros"),
    } as never;
    generator.valueToCode = vi
      .fn((_block, inputName) => {
        if (inputName === "AT") {
          return "2";
        }

        if (inputName === "TO") {
          return "42";
        }

        return "";
      }) as never;

    const result = generator.forBlock["list_var_set_index"](block as never, generator as never);

    expect(result).toBe("numeros[2] = 42;\n");
  });
});
