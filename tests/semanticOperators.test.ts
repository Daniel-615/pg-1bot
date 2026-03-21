import { describe, expect, it, vi } from "vitest";
import { Operators } from "../src/core/blockEngine/semantic/operators/operators";
import { createBlock } from "./helpers/semanticMocks";

type IssueSeverity = "error" | "warning" | "suggestion";

function createAnalyzerMock() {
  return {
    addIssuePublic: vi.fn<
      (block: unknown, message: string, severity: IssueSeverity) => void
    >(),
    getVariableName: vi.fn((block: { getFieldValue: (name: string) => string }) =>
      block.getFieldValue("VAR")
    ),
  };
}

describe("Operators", () => {
  it("avisa cuando una resta numérica dará un resultado negativo", () => {
    const analyzer = createAnalyzerMock();
    const operators = new Operators(analyzer as never);
    const block = createBlock({ id: "sub", type: "math_subtract" });
    const left = createBlock({ id: "a", type: "number", fields: { NUM: "2" } });
    const right = createBlock({ id: "b", type: "number", fields: { NUM: "5" } });

    operators.handleSubtract(block as never, left as never, right as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "El resultado de la resta será negativo",
      "warning"
    );
  });

  it("detecta división por uno, por cero y entre la misma variable", () => {
    const analyzer = createAnalyzerMock();
    const operators = new Operators(analyzer as never);
    const block = createBlock({ id: "div", type: "math_divide" });
    const varA = createBlock({ id: "va", type: "variables_get", fields: { VAR: "x" } });
    const varB = createBlock({ id: "vb", type: "variables_get", fields: { VAR: "x" } });
    const one = createBlock({ id: "one", type: "number", fields: { NUM: "1" } });
    const zero = createBlock({ id: "zero", type: "number", fields: { NUM: "0" } });

    operators.handleDivide(block as never, varA as never, one as never);
    operators.handleDivide(block as never, varA as never, zero as never);
    operators.handleDivide(block as never, varA as never, varB as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Dividir por 1 no cambia su valor",
      "suggestion"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "No se puede realizar una división por cero",
      "error"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Dividir una variable por sí misma siempre da 1",
      "suggestion"
    );
  });

  it("detecta sumas con cero en sus tres variantes", () => {
    const analyzer = createAnalyzerMock();
    const operators = new Operators(analyzer as never);
    const block = createBlock({ id: "add", type: "math_add" });

    operators.handleVariablePlusZero(
      block as never,
      createBlock({ id: "n1", type: "number", fields: { NUM: "0" } }) as never,
      createBlock({ id: "n2", type: "number", fields: { NUM: "0" } }) as never
    );
    operators.handleVariablePlusZero(
      block as never,
      createBlock({ id: "vg1", type: "variables_get", fields: { VAR: "x" } }) as never,
      createBlock({ id: "n3", type: "number", fields: { NUM: "0" } }) as never
    );
    operators.handleVariablePlusZero(
      block as never,
      createBlock({ id: "n4", type: "number", fields: { NUM: "0" } }) as never,
      createBlock({ id: "vg2", type: "variables_get", fields: { VAR: "x" } }) as never
    );

    expect(analyzer.addIssuePublic).toHaveBeenCalledTimes(3);
  });

  it("detecta multiplicaciones por cero y por uno", () => {
    const analyzer = createAnalyzerMock();
    const operators = new Operators(analyzer as never);
    const block = createBlock({ id: "mul", type: "math_multiply" });

    operators.handleMultiply(
      block as never,
      createBlock({ id: "m1", type: "number", fields: { NUM: "0" } }) as never,
      createBlock({ id: "m2", type: "number", fields: { NUM: "7" } }) as never
    );
    operators.handleMultiply(
      block as never,
      createBlock({ id: "m3", type: "number", fields: { NUM: "5" } }) as never,
      createBlock({ id: "m4", type: "number", fields: { NUM: "1" } }) as never
    );

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Multiplicar por 0 siempre da 0",
      "suggestion"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Multiplicar con 1 siempre da su mismo valor",
      "suggestion"
    );
  });

  it("detecta restas con cero y expresiones sin usar", () => {
    const analyzer = createAnalyzerMock();
    const operators = new Operators(analyzer as never);
    const subtractBlock = createBlock({ id: "sub-zero", type: "math_subtract" });
    const unusedBlock = createBlock({
      id: "unused",
      type: "math_add",
      outputConnected: false,
    });

    operators.handleVariableSubtractZero(
      subtractBlock as never,
      createBlock({ id: "s1", type: "number", fields: { NUM: "0" } }) as never,
      createBlock({ id: "s2", type: "number", fields: { NUM: "0" } }) as never
    );
    operators.handleVariableSubtractZero(
      subtractBlock as never,
      createBlock({ id: "s3", type: "variables_get", fields: { VAR: "x" } }) as never,
      createBlock({ id: "s4", type: "number", fields: { NUM: "0" } }) as never
    );
    operators.checkUnusedExpression(unusedBlock as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      subtractBlock,
      "Restar 0 con 0 no cambia su valor",
      "suggestion"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      subtractBlock,
      "Restar 0 a una variable no cambia su valor",
      "suggestion"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      unusedBlock,
      "El resultado de esta expresión no se utiliza",
      "warning"
    );
  });
});
