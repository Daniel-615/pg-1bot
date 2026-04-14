import { describe, expect, it, vi } from "vitest";
import { Variables } from "../src/core/blockEngine/semantic/base/variables/variables";
import { SymbolTable } from "../src/core/blockEngine/semantic/base/symbolTable";

type IssueSeverity = "error" | "warning" | "suggestion";

type MockBlock = {
  id: string;
  type: string;
  workspace?: {
    getVariableById: (id: string) => { getName: () => string } | null;
  };
  getFieldValue: (name: string) => string;
};

function createVariableBlock(name: string, type = "variables_get"): MockBlock {
  return {
    id: `${type}-${name}`,
    type,
    workspace: {
      getVariableById: (id: string) => ({
        getName: () => (id === name ? name : id),
      }),
    },
    getFieldValue: () => name,
  };
}

function createAnalyzerMock() {
  return {
    addIssuePublic: vi.fn<
      (block: MockBlock, message: string, severity: IssueSeverity) => void
    >(),
    getVariableName: vi.fn((block: MockBlock) => block.getFieldValue("VAR")),
  };
}

describe("Variables", () => {
  it("reporta error al usar una variable no declarada", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);

    const block = createVariableBlock("led");
    variables.handleVariableUse(block as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Variable no declarada",
      "error"
    );
  });

  it("reporta error al usar una variable declarada pero no inicializada", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);

    symbolTable.declare("sensor", "number");
    const block = createVariableBlock("sensor");

    variables.handleVariableUse(block as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Variable no inicializada",
      "error"
    );
    expect(symbolTable.lookup("sensor")?.used).toBe(true);
  });

  it("declara y asigna una variable cuando aún no existe", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);

    const block = createVariableBlock("mensaje", "variables_set");
    variables.checkOrDeclareVariable("mensaje", "string", "hola", block as never);

    expect(symbolTable.lookup("mensaje")).toMatchObject({
      type: "string",
      value: "hola",
      initialized: true,
    });
    expect(analyzer.addIssuePublic).not.toHaveBeenCalled();
  });

  it("reporta tipos incompatibles cuando se reasigna con otro tipo", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);

    symbolTable.declare("dato", "number");
    symbolTable.assign("dato", 10, "number");
    const block = createVariableBlock("dato", "variables_set");

    variables.checkOrDeclareVariable("dato", "boolean", true, block as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      block,
      "Tipo incompatible. Esperado: number, recibido: boolean",
      "error"
    );
    expect(symbolTable.lookup("dato")).toMatchObject({
      type: "boolean",
      value: true,
      initialized: true,
    });
  });

  it("marca variables sin uso dentro del workspace", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);
    const setBlock = createVariableBlock("contador", "variables_set");

    symbolTable.declare("contador", "number");
    symbolTable.assign("contador", 3, "number");

    const workspace = {
      getAllBlocks: () => [setBlock],
    };

    variables.checkUnusedVariables(workspace as never);

    expect(analyzer.addIssuePublic).toHaveBeenCalledWith(
      setBlock,
      "Variable declarada pero no utilizada",
      "warning"
    );
  });

  it("no marca advertencia cuando la variable ya fue usada", () => {
    const symbolTable = new SymbolTable();
    const analyzer = createAnalyzerMock();
    const variables = new Variables(symbolTable, analyzer as never);
    const setBlock = createVariableBlock("contador", "variables_set");

    symbolTable.declare("contador", "number");
    symbolTable.assign("contador", 3, "number");
    symbolTable.use("contador");

    const workspace = {
      getAllBlocks: () => [setBlock],
    };

    variables.checkUnusedVariables(workspace as never);

    expect(analyzer.addIssuePublic).not.toHaveBeenCalled();
  });
});
