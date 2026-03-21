import { describe, expect, it, vi } from "vitest";
import { ArduinoSemanticAnalyzer } from "../src/core/blockEngine/semantic/arduinoSemanticAnalyzer";
import { createBlock, createWorkspace } from "./helpers/semanticMocks";

describe("ArduinoSemanticAnalyzer", () => {
  it("analiza asignaciones y usos, y expone la tabla de símbolos", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const value = createBlock({ id: "num-1", type: "math_number", fields: { NUM: "5" } });
    const setBlock = createBlock({
      id: "set-1",
      type: "variables_set",
      fields: { VAR: "var-led" },
      inputs: { VALUE: value },
    });
    const getBlock = createBlock({
      id: "get-1",
      type: "variables_get",
      fields: { VAR: "var-led" },
    });
    setBlock.getNextBlock = () => getBlock;
    const workspace = createWorkspace([setBlock], { "var-led": "led" });

    analyzer.analyze(workspace as never);

    expect(getBlock.warningText).toBeNull();
    expect(analyzer.getSymbolTableRows()).toEqual([
      {
        name: "led",
        type: "number",
        value: 5,
        initialized: true,
        used: true,
        scopeLevel: 0,
      },
    ]);
  });

  it("marca variables declaradas pero no usadas", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const setBlock = createBlock({
      id: "set-unused",
      type: "variables_set",
      fields: { VAR: "var-contador" },
      inputs: {
        VALUE: createBlock({ id: "num-2", type: "math_number", fields: { NUM: "3" } }),
      },
    });
    const workspace = createWorkspace([setBlock], { "var-contador": "contador" });

    analyzer.analyze(workspace as never);

    expect(setBlock.warningText).toContain("Variable declarada pero no utilizada");
  });

  it("reporta warning por operador matemático con tipos incompatibles", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const mathBlock = createBlock({
      id: "add-1",
      type: "math_add",
      inputs: {
        A: createBlock({ id: "left-string", type: "string", fields: { STRING: "hola" } }),
        B: createBlock({ id: "right-num", type: "math_number", fields: { NUM: "1" } }),
      },
      outputConnected: true,
    });
    const workspace = createWorkspace([mathBlock]);

    analyzer.analyze(workspace as never);

    expect(mathBlock.warningText).toContain("Los operadores matemáticos requieren valores numéricos");
  });

  it("reporta errores y sugerencias en operadores lógicos y comparaciones", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const andBlock = createBlock({
      id: "and-1",
      type: "logic_and",
      inputs: {
        A: createBlock({ id: "and-left", type: "math_number", fields: { NUM: "1" } }),
        B: createBlock({ id: "and-right", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
      },
    });
    const greaterBlock = createBlock({
      id: "greater-1",
      type: "logic_greater",
      inputs: {
        A: createBlock({ id: "gt-left", type: "string", fields: { STRING: "a" } }),
        B: createBlock({ id: "gt-right", type: "math_number", fields: { NUM: "2" } }),
      },
    });
    const equalsBlock = createBlock({
      id: "equals-1",
      type: "logic_equals",
      inputs: {
        A: createBlock({ id: "eq-left", type: "math_number", fields: { NUM: "2" } }),
        B: createBlock({ id: "eq-right", type: "string", fields: { STRING: "2" } }),
      },
    });
    const workspace = createWorkspace([andBlock, greaterBlock, equalsBlock]);

    analyzer.analyze(workspace as never);

    expect(andBlock.warningText).toContain("Los operadores AND/OR deben usar valores booleanos");
    expect(greaterBlock.warningText).toContain("Las comparaciones < y > deben usar números");
    expect(equalsBlock.warningText).toContain("Estás comparando valores de distinto tipo");
  });

  it("detecta división por cero y expresiones no usadas", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const divideBlock = createBlock({
      id: "div-1",
      type: "math_divide",
      inputs: {
        A: createBlock({ id: "div-left", type: "math_number", fields: { NUM: "10" } }),
        B: createBlock({ id: "div-right", type: "math_number", fields: { NUM: "0" } }),
      },
      outputConnected: false,
    });
    const workspace = createWorkspace([divideBlock]);

    analyzer.analyze(workspace as never);

    expect(divideBlock.warningText).toContain("No se puede realizar una división por cero");
    expect(divideBlock.warningText).toContain("El resultado de esta expresión no se utiliza");
  });

  it("valida while y do_while usando la entrada CONDITION", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const whileBlock = createBlock({
      id: "while-ok",
      type: "while_repeat",
      inputs: {
        CONDITION: createBlock({ id: "while-cond", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        BODY: createBlock({ id: "while-body", type: "variables_get", fields: { VAR: "ghost" } }),
      },
    });
    const doWhileBlock = createBlock({
      id: "do-ok",
      type: "do_while",
      inputs: {
        CONDITION: createBlock({ id: "do-cond", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        BODY: createBlock({ id: "do-body", type: "variables_get", fields: { VAR: "ghost2" } }),
      },
    });
    const workspace = createWorkspace([whileBlock, doWhileBlock]);

    analyzer.analyze(workspace as never);

    expect(whileBlock.warningText).toBeNull();
    expect(doWhileBlock.warningText).toBeNull();
  });

  it("valida FOR_RANGE con límites no numéricos", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const forBlock = createBlock({
      id: "for-bad",
      type: "for_range",
      fields: { VAR: "var-i" },
      inputs: {
        FROM: createBlock({ id: "for-from", type: "string", fields: { STRING: "a" } }),
        TO: createBlock({ id: "for-to", type: "math_number", fields: { NUM: "5" } }),
        BODY: createBlock({ id: "for-body", type: "variables_get", fields: { VAR: "var-i" } }),
      },
    });
    const workspace = createWorkspace([forBlock], { "var-i": "i" });

    analyzer.analyze(workspace as never);

    expect(forBlock.warningText).toContain("Los valores del 'mientras' deben ser numéricos");
  });

  it("permite depurar paso a paso y guarda historial", () => {
    const analyzer = new ArduinoSemanticAnalyzer();
    const logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
    const setBlock = createBlock({
      id: "debug-set",
      type: "variables_set",
      fields: { VAR: "var-debug" },
      inputs: {
        VALUE: createBlock({ id: "debug-value", type: "math_number", fields: { NUM: "8" } }),
      },
    });
    const workspace = createWorkspace([setBlock], { "var-debug": "debugVar" });

    analyzer.startDebug(workspace as never);
    analyzer.step(workspace as never);
    analyzer.step(workspace as never);
    analyzer.step(workspace as never);

    expect(setBlock.selected).toBe(true);
    expect(analyzer.getHistory()).toHaveLength(2);
    expect(analyzer.getCurrentSymbolState()[0].get("debugVar")).toMatchObject({
      value: 8,
      initialized: true,
    });

    logSpy.mockRestore();
  });
});
