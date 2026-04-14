import { describe, expect, it, vi } from "vitest";
import { Conditions } from "../src/core/blockEngine/semantic/base/conditions/conditions";
import { SymbolTable } from "../src/core/blockEngine/semantic/base/symbolTable";
import { createBlock } from "./helpers/semanticMocks";

type IssueSeverity = "error" | "warning" | "suggestion";

function createAnalyzerMock() {
  return {
    addIssuePublic: vi.fn(),
    visitPublic: vi.fn(),
  } as {
    addIssuePublic: ReturnType<typeof vi.fn<
      (block: unknown, message: string, severity: IssueSeverity) => void
    >>;
    visitPublic: ReturnType<typeof vi.fn<(block: unknown) => void>>;
  };
}

describe("Conditions", () => {
  it("marca warning por condición vacía y error por cuerpo vacío en IF", () => {
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(new SymbolTable(), analyzer as never);
    const block = createBlock({ id: "if-1", type: "if" });

    const result = conditions.handleIf(block as never, null);

    expect(result).toBe(false);
    expect(analyzer.addIssuePublic).toHaveBeenNthCalledWith(
      1,
      block,
      "La condición del si está vacía",
      "warning"
    );
    expect(analyzer.addIssuePublic).toHaveBeenNthCalledWith(
      2,
      block,
      "El cuerpo del si está vacío",
      "error"
    );
  });

  it("visita el cuerpo del IF dentro de un scope temporal", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    analyzer.visitPublic.mockImplementation(() => {
      symbolTable.declare("interna", "number");
    });
    const conditions = new Conditions(symbolTable, analyzer as never);
    const body = createBlock({ id: "body-if", type: "variables_set" });
    const block = createBlock({
      id: "if-2",
      type: "if",
      inputs: {
        CONDITION: createBlock({ id: "cond-if", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
        IF_BODY: body,
      },
    });

    const result = conditions.handleIf(block as never, "boolean");

    expect(result).toBe(true);
    expect(analyzer.visitPublic).toHaveBeenCalledWith(body);
    expect(symbolTable.lookup("interna")).toBeNull();
  });

  it("rechaza IF_ELSE con condición de tipo incorrecto", () => {
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(new SymbolTable(), analyzer as never);
    const block = createBlock({
      id: "ifelse-1",
      type: "if_else",
      inputs: {
        CONDITION: createBlock({ id: "cond", type: "math_number", fields: { NUM: "1" } }),
      },
    });

    const result = conditions.handleIfElse(block as never, "number");

    expect(result).toBe(false);
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "La condición del si debe ser booleana",
      "error"
    );
  });

  it("reporta ramas faltantes en IF_ELSE", () => {
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(new SymbolTable(), analyzer as never);
    const block = createBlock({
      id: "ifelse-2",
      type: "if_else",
      inputs: {
        CONDITION: createBlock({ id: "cond-bool", type: "logic_boolean", fields: { BOOL: "TRUE" } }),
      },
    });

    const result = conditions.handleIfElse(block as never, "boolean");

    expect(result).toBe(true);
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "El cuerpo del entonces está vacío.",
      "error"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "El cuerpo del sino está vacío",
      "warning"
    );
  });

  it("valida condición y cuerpo en WHILE", () => {
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(new SymbolTable(), analyzer as never);
    const block = createBlock({ id: "while-1", type: "while_repeat" });

    const result = conditions.handleWhile(block as never, null);

    expect(result).toBe(false);
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "La condición del mientras está vacía.",
      "error"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "El cuerpo del mientras está vacío",
      "error"
    );
  });

  it("valida cuerpo y condición en DO_WHILE", () => {
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(new SymbolTable(), analyzer as never);
    const block = createBlock({ id: "do-1", type: "do_while" });

    const result = conditions.handleDoWhile(block as never);

    expect(result).toBe(false);
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "El cuerpo de hacer no debe estar vacío.",
      "error"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "La condición de mientras no debe estar vacía.",
      "error"
    );
  });

  it("avisa cuando faltan límites en FOR y limpia el scope aunque falte el cuerpo", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(symbolTable, analyzer as never);
    const block = createBlock({
      id: "for-1",
      type: "for_range",
    });

    conditions.handleForRange(block as never, "i");

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "'de' debe llevar un entero",
      "warning"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "'to' debe llevar un entero",
      "warning"
    );
    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "el cuerpo de 'hacer' no debe estar vacío.",
      "error"
    );
    expect(symbolTable.lookup("i")).toBeNull();
  });

  it("visita el cuerpo del FOR y elimina la variable de control al salir", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const conditions = new Conditions(symbolTable, analyzer as never);
    const body = createBlock({ id: "body-for", type: "variables_set" });
    const block = createBlock({
      id: "for-2",
      type: "for_range",
      inputs: {
        FROM: createBlock({ id: "from", type: "math_number", fields: { NUM: "0" } }),
        TO: createBlock({ id: "to", type: "math_number", fields: { NUM: "10" } }),
        BODY: body,
      },
    });

    conditions.handleForRange(block as never, "i");

    expect(analyzer.visitPublic).toHaveBeenCalledWith(body);
    expect(symbolTable.lookup("i")).toBeNull();
  });
});
