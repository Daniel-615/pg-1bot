import { describe, expect, it } from "vitest";
import { SymbolTable } from "../src/core/blockEngine/semantic/base/symbolTable";

describe("SymbolTable", () => {
  it("declara una variable con su tipo y estado inicial", () => {
    const table = new SymbolTable();

    const declared = table.declare("led", "number");
    const symbol = table.lookup("led");

    expect(declared).toBe(true);
    expect(symbol).not.toBeNull();
    expect(symbol).toMatchObject({
      name: "led",
      type: "number",
      value: null,
      initialized: false,
      used: false,
      scopeLevel: 0,
      scopeId: 0,
      scopeKind: "global",
    });
  });

  it("asigna y marca una variable como usada", () => {
    const table = new SymbolTable();

    table.declare("activo", "boolean");
    const assigned = table.assign("activo", true, "boolean");
    const used = table.use("activo");

    expect(assigned).toBe(true);
    expect(used).not.toBeNull();
    expect(used).toMatchObject({
      type: "boolean",
      value: true,
      initialized: true,
      used: true,
    });
  });

  it("respeta el alcance de variables entre scopes", () => {
    const table = new SymbolTable();

    table.declare("mensaje", "string");
    table.assign("mensaje", "global", "string");

    table.enterScope();
    table.declare("mensajeLocal", "string");
    table.assign("mensajeLocal", "interno", "string");

    expect(table.lookup("mensaje")?.value).toBe("global");
    expect(table.lookup("mensajeLocal")?.value).toBe("interno");

    table.exitScope();

    expect(table.lookup("mensaje")?.value).toBe("global");
    expect(table.lookup("mensajeLocal")).toBeNull();
  });

  it("no permite redeclarar una variable en el mismo scope", () => {
    const table = new SymbolTable();

    const firstDeclaration = table.declare("contador", "number");
    const secondDeclaration = table.declare("contador", "boolean");

    expect(firstDeclaration).toBe(true);
    expect(secondDeclaration).toBe(false);
    expect(table.lookup("contador")).toMatchObject({
      type: "number",
      initialized: false,
    });
  });

  it("permite sombrear variables en un scope interno", () => {
    const table = new SymbolTable();

    table.declare("estado", "boolean");
    table.assign("estado", true, "boolean");

    table.enterScope();
    table.declare("estado", "string");
    table.assign("estado", "interno", "string");

    expect(table.lookup("estado")).toMatchObject({
      type: "string",
      value: "interno",
      scopeLevel: 1,
      scopeKind: "local",
    });

    table.exitScope();

    expect(table.lookup("estado")).toMatchObject({
      type: "boolean",
      value: true,
      scopeLevel: 0,
    });
  });

  it("devuelve false o null al asignar o usar variables inexistentes", () => {
    const table = new SymbolTable();

    expect(table.assign("fantasma", 10, "number")).toBe(false);
    expect(table.use("fantasma")).toBeNull();
  });

  it("guarda snapshots inmutables de cada cambio relevante", () => {
    const table = new SymbolTable();

    table.declare("total", "number");
    table.assign("total", 21, "number");
    table.use("total");

    const snapshots = table.getSnapshots();

    expect(snapshots).toHaveLength(3);
    expect(snapshots[0]).toMatchObject({ step: 0 });
    expect(snapshots[0].scopes[0].get("total")).toMatchObject({
      value: null,
      initialized: false,
      used: false,
    });
    expect(snapshots[1].scopes[0].get("total")).toMatchObject({
      value: 21,
      initialized: true,
      used: false,
    });
    expect(snapshots[2].scopes[0].get("total")).toMatchObject({
      value: 21,
      initialized: true,
      used: true,
    });
  });

  it("expone filas y objeto plano con el estado final", () => {
    const table = new SymbolTable();

    table.declare("nombre", "string");
    table.assign("nombre", "Ada", "string");
    table.enterScope();
    table.declare("activo", "boolean");
    table.assign("activo", false, "boolean");

    expect(table.getRows()).toEqual([
      {
        name: "nombre",
        type: "string",
        value: "Ada",
        initialized: true,
        used: false,
        scopeLevel: 0,
        scopeId: 0,
        scopeKind: "global",
        active: true,
      },
      {
        name: "activo",
        type: "boolean",
        value: false,
        initialized: true,
        used: false,
        scopeLevel: 1,
        scopeId: 1,
        scopeKind: "local",
        active: true,
      },
    ]);

    expect(table.toFlatObject()).toEqual({
      nombre: {
        type: "string",
        value: "Ada",
        initialized: true,
        used: false,
        scopeLevel: 0,
        scopeId: 0,
        scopeKind: "global",
      },
      activo: {
        type: "boolean",
        value: false,
        initialized: true,
        used: false,
        scopeLevel: 1,
        scopeId: 1,
        scopeKind: "local",
      },
    });
  });

  it("mantiene visibles filas de scopes locales cerrados", () => {
    const table = new SymbolTable();

    table.declare("globalFlag", "boolean");
    table.assign("globalFlag", true, "boolean");
    table.enterScope();
    table.declare("temp", "number");
    table.assign("temp", 99, "number");
    table.exitScope();

    expect(table.getRows()).toEqual([
      expect.objectContaining({
        name: "globalFlag",
        scopeKind: "global",
        active: true,
      }),
      expect.objectContaining({
        name: "temp",
        scopeKind: "local",
        active: false,
      }),
    ]);
  });

  it("reinicia completamente el estado interno", () => {
    const table = new SymbolTable();

    table.declare("temp", "number");
    table.assign("temp", 42, "number");
    table.enterScope();
    table.declare("flag", "boolean");

    table.reset();

    expect(table.lookup("temp")).toBeNull();
    expect(table.lookup("flag")).toBeNull();
    expect(table.getSnapshots()).toEqual([]);
    expect(table.getRows()).toEqual([]);
    expect(table.getFinalState()).toHaveLength(1);
  });
});
