import * as Blockly from "blockly";
import { SymbolTable } from "./symbolTable";
import type { SymbolTableRow, VarType } from "./symbolTable";
import { Variables } from "./variables/variables";
import { Conditions } from "./conditions/conditions";
import { Operators } from "./operators/operators";

type Severity = "error" | "warning" | "suggestion";

interface Issue {
  message: string;
  severity: Severity;
}

export class ArduinoSemanticAnalyzer {
  private symbolTable!: SymbolTable;
  private variables!: Variables;
  private conditions!: Conditions;
  private operators!: Operators;
  private errors!: Map<string, Issue[]>;

  private debugMode = false;
  private blocksQueue: Blockly.Block[] = [];
  private history: Array<Map<string, unknown>[]> = [];
  private currentIndex = 0;

  analyze(workspace: Blockly.Workspace) {
    this.debugMode = false;
    this.initializeState();

    workspace.getAllBlocks(false).forEach(block => {
      block.setWarningText(null);
    });

    const topBlocks = workspace.getTopBlocks(true);
    for (const block of topBlocks) {
      this.visit(block);
    }

    this.checkUnusedVariables(workspace);
    this.renderWarnings(workspace);
  }

  startDebug(workspace: Blockly.Workspace) {
    this.debugMode = true;
    this.initializeState();
    this.blocksQueue = [];
    this.history = [];
    this.currentIndex = 0;

    const topBlocks = workspace.getTopBlocks(true);
    this.blocksQueue.push(...topBlocks);
  }

  step(workspace: Blockly.Workspace) {
    if (this.currentIndex >= this.blocksQueue.length) {
      console.log("Fin del análisis");
      this.checkUnusedVariables(workspace);
      this.renderWarnings(workspace);
      return;
    }

    const block = this.blocksQueue[this.currentIndex];
    (block as { select?: () => void }).select?.();

    this.visit(block);
    this.history.push(this.symbolTable.cloneState() as Array<Map<string, unknown>>);

    console.log("Estado actual tabla:", this.symbolTable.getFinalState());

    this.currentIndex++;
  }

  getHistory() {
    return this.history;
  }

  getCurrentSymbolState() {
    return this.symbolTable.getFinalState();
  }

  getSymbolTableRows(): SymbolTableRow[] {
    return this.symbolTable.getRows();
  }

  getVariables() {
    return this.variables;
  }

  getConditions() {
    return this.conditions;
  }

  public visitPublic(block: Blockly.Block | null) {
    this.visit(block);
  }

  public getVariableName(block: Blockly.Block, fieldName = "VAR"): string | null {
    const variableId = block.getFieldValue(fieldName);
    if (!variableId) return null;

    const variableModel = block.workspace?.getVariableById(variableId);
    return variableModel?.getName() ?? variableId;
  }

  public addIssuePublic(block: Blockly.Block, message: string, severity: Severity) {
    this.addIssue(block, message, severity);
  }

  private initializeState() {
    this.symbolTable = new SymbolTable();
    this.variables = new Variables(this.symbolTable, this);
    this.conditions = new Conditions(this.symbolTable, this);
    this.operators = new Operators(this);
    this.errors = new Map();
  }

  private getConditionBlock(block: Blockly.Block) {
    return (
      block.getInputTargetBlock("CONDITION") ||
      block.getInputTargetBlock("BOOLEAN") ||
      block.getInputTargetBlock("BOOL")
    );
  }

  private getBinaryInputs(block: Blockly.Block) {
    return {
      left: block.getInputTargetBlock("A"),
      right: block.getInputTargetBlock("B"),
    };
  }

  private traverseChildren(block: Blockly.Block) {
    block.inputList.forEach(input => {
      const child = input.connection?.targetBlock();
      if (!child) return;

      if (this.debugMode) {
        this.blocksQueue.push(child);
      } else {
        this.visit(child);
      }
    });

    const next = block.getNextBlock();
    if (!next) return;

    if (this.debugMode) {
      this.blocksQueue.push(next);
      return;
    }

    this.visit(next);
  }

  private visit(block: Blockly.Block | null) {
    if (!block) return;

    block.setWarningText(null);

    switch (block.type) {
      case "variables_set":
        this.handleAssignment(block);
        break;

      case "variables_get":
      case "list_var_get_index":
        this.handleVariableUse(block);
        break;

      case "list_var_set_index":
        this.handleListSetIndex(block);
        break;

      case "if": {
        const ok = this.handleIf(block);
        if (!ok) return;
        break;
      }

      case "if_else":
        this.handleIfElse(block);
        break;

      case "while_repeat":
        this.handleWhile(block);
        break;

      case "do_while":
        this.handleDoWhile(block);
        break;

      case "for_range":
        this.handleForRange(block);
        break;

      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide":
        this.handleOperatorMath(block);
        this.handleCheckUnusedExpression(block);

        if (block.type === "math_add") {
          this.handleVariablePlusZero(block);
        }
        if (block.type === "math_subtract") {
          this.handleSubtractOperator(block);
          this.handleVariableSubtractZero(block);
        }
        if (block.type === "math_multiply") {
          this.handleMultiply(block);
        }
        if (block.type === "math_divide") {
          this.handleDivide(block);
        }
        break;

      case "logic_and":
      case "logic_or":
      case "logic_not":
      case "logic_less":
      case "logic_greater":
      case "logic_equals":
        this.handleOperatorLogic(block);
        break;
    }

    this.traverseChildren(block);
  }

  private handleVariableSubtractZero(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleVariableSubtractZero(block, left, right);
  }

  private handleSubtractOperator(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) {
      console.log("HandleSubtractOperator A o B se encuentran vacíos.");
      return;
    }

    this.operators.handleSubtract(block, left, right);
  }

  private handleAssignment(block: Blockly.Block) {
    const name = this.getVariableName(block);
    const valueBlock = block.getInputTargetBlock("VALUE");
    const inferredType = this.inferType(valueBlock);
    const inferredValue = this.inferValue(valueBlock);

    if (!inferredType) return;

    this.getVariables().checkOrDeclareVariable(name, inferredType, inferredValue, block);
  }

  private checkUnusedVariables(workspace: Blockly.Workspace) {
    this.getVariables().checkUnusedVariables(workspace);
  }

  private handleVariableUse(block: Blockly.Block) {
    this.getVariables().handleVariableUse(block);
  }

  private handleListSetIndex(block: Blockly.Block) {
    this.getVariables().handleVariableUse(block);

    const name = this.getVariableName(block);
    if (!name) return;

    const symbol = this.symbolTable.lookup(name);
    if (!symbol || !Array.isArray(symbol.value)) return;

    const nextValue = [...symbol.value];
    const where = block.getFieldValue("WHERE") || "FROM_START";
    const valueToAssign = this.inferValue(block.getInputTargetBlock("TO"));

    let index = 0;
    if (where === "FIRST") {
      index = 0;
    } else if (where === "LAST") {
      index = nextValue.length - 1;
    } else {
      const atValue = this.inferValue(block.getInputTargetBlock("AT"));
      if (typeof atValue !== "number") return;
      index = atValue;
    }

    if (index < 0 || index >= nextValue.length) return;

    nextValue[index] = valueToAssign;
    this.symbolTable.assign(name, nextValue, "array");
  }

  private handleIf(block: Blockly.Block) {
    try {
      const condition = this.getConditionBlock(block);
      const type = this.inferType(condition);
      const ok = this.getConditions().handleIf(block, type);
      return ok ?? false;
    } catch (err) {
      console.log("Error en handleIf", err);
    }
  }

  private handleIfElse(block: Blockly.Block) {
    const condition = this.getConditionBlock(block);
    const type = this.inferType(condition);
    const ok = this.getConditions().handleIfElse(block, type);
    if (!ok) return;
  }

  private handleWhile(block: Blockly.Block) {
    const condition = this.getConditionBlock(block);
    const type = this.inferType(condition);

    const ok = this.getConditions().handleWhile(block, type);
    if (!ok) return;
  }

  private handleDoWhile(block: Blockly.Block) {
    const ok = this.getConditions().handleDoWhile(block);
    if (!ok) {
      return;
    }

    const condition = this.getConditionBlock(block);
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del mientras debe ser true/false", "error");
    }
  }

  private handleForRange(block: Blockly.Block) {
    const varName = this.getVariableName(block);
    if (!varName) return;

    const fromType = this.inferType(block.getInputTargetBlock("FROM"));
    const toType = this.inferType(block.getInputTargetBlock("TO"));

    if (fromType !== "number" || toType !== "number") {
      this.addIssue(block, "Los valores del 'mientras' deben ser numéricos", "error");
    }

    this.getConditions().handleForRange(block, varName);
  }

  private handleMultiply(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleMultiply(block, left, right);
  }

  private handleDivide(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleDivide(block, left, right);
  }

  private handleVariablePlusZero(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleVariablePlusZero(block, left, right);
  }

  private handleCheckUnusedExpression(block: Blockly.Block) {
    this.operators.checkUnusedExpression(block);
  }

  private handleOperatorMath(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    if (!left || !right) return;

    const typeA = this.inferType(left);
    const typeB = this.inferType(right);

    if (typeA !== "number" || typeB !== "number") {
      this.addIssue(
        block,
        "Los operadores matemáticos requieren valores numéricos",
        "warning"
      );
    }

    if (block.type === "math_divide" && right.type === "math_number") {
      const value = Number(right.getFieldValue("NUM"));
      if (value === 0) {
        this.addIssue(block, "No se puede realizar una división por cero", "error");
      }
    }
  }

  private handleOperatorLogic(block: Blockly.Block) {
    const { left, right } = this.getBinaryInputs(block);
    const typeA = this.inferType(left);
    const typeB = this.inferType(right);

    switch (block.type) {
      case "logic_and":
      case "logic_or":
        if (typeA !== "boolean" || typeB !== "boolean") {
          this.addIssue(block, "Los operadores AND/OR deben usar valores booleanos", "error");
        }
        break;

      case "logic_not":
        if (typeA !== "boolean") {
          this.addIssue(block, "El operador NOT solo funciona con booleanos", "error");
        }
        break;

      case "logic_greater":
      case "logic_less":
        if (typeA !== "number" || typeB !== "number") {
          this.addIssue(block, "Las comparaciones < y > deben usar números ", "warning");
        }
        break;

      case "logic_equals":
        if (typeA !== typeB) {
          this.addIssue(block, "Estás comparando valores de distinto tipo", "suggestion");
        }
        break;
    }
  }

  private inferType(block: Blockly.Block | null): VarType {
    if (!block) return null;

    switch (block.type) {
      case "number":
      case "math_number":
      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide":
        return "number";

      case "logic_boolean":
      case "logic_and":
      case "logic_or":
      case "logic_not":
      case "logic_less":
      case "logic_equals":
      case "logic_greater":
        return "boolean";

      case "string":
        return "string";

      case "lists_create_empty":
      case "lists_create_with":
      case "lists_repeat":
        return "array";

      case "lists_length":
        return "number";

      case "lists_getIndex": {
        const listBlock = block.getInputTargetBlock("VALUE");
        if (!listBlock) return null;

        if (listBlock.type === "string") {
          return "string";
        }

        if (listBlock.type === "variables_get") {
          const symbol = this.symbolTable.lookup(this.getVariableName(listBlock) ?? "");
          return symbol?.type === "array" ? "number" : symbol?.type ?? null;
        }

        return "number";
      }

      case "list_var_get_index": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        if (!symbol) return null;
        return symbol.type === "array" ? "number" : symbol.type;
      }

      case "variables_get": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        return symbol?.type ?? null;
      }

      default:
        return null;
    }
  }

  private inferValue(block: Blockly.Block | null): unknown {
    if (!block) return null;

    switch (block.type) {
      case "number":
      case "math_number":
        return Number(block.getFieldValue("NUM"));

      case "logic_boolean":
        return block.getFieldValue("BOOL") === "TRUE";

      case "string":
        return block.getFieldValue("STRING");

      case "lists_create_empty":
        return [];

      case "lists_create_with": {
        const items: unknown[] = [];
        const itemCount = Number((block as Blockly.Block & { itemCount_?: number }).itemCount_ ?? 0);

        for (let index = 0; index < itemCount; index += 1) {
          items.push(this.inferValue(block.getInputTargetBlock(`ADD${index}`)));
        }

        return items;
      }

      case "lists_length": {
        const value = this.inferValue(block.getInputTargetBlock("VALUE"));
        if (Array.isArray(value) || typeof value === "string") {
          return value.length;
        }
        return null;
      }

      case "lists_getIndex": {
        const listValue = this.inferValue(block.getInputTargetBlock("VALUE"));
        const where = block.getFieldValue("WHERE") || "FROM_START";

        if (typeof listValue === "string") {
          if (where === "FIRST") return listValue[0] ?? null;
          if (where === "LAST") return listValue[listValue.length - 1] ?? null;
        }

        if (!Array.isArray(listValue)) return null;

        if (where === "FIRST") return listValue[0] ?? null;
        if (where === "LAST") return listValue[listValue.length - 1] ?? null;

        const atBlock = block.getInputTargetBlock("AT");
        const index = this.inferValue(atBlock);
        return typeof index === "number" ? listValue[index] ?? null : null;
      }

      case "list_var_get_index": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        const listValue = symbol?.value;
        const where = block.getFieldValue("WHERE") || "FROM_START";

        if (!Array.isArray(listValue)) return null;

        if (where === "FIRST") return listValue[0] ?? null;
        if (where === "LAST") return listValue[listValue.length - 1] ?? null;

        const atBlock = block.getInputTargetBlock("AT");
        const index = this.inferValue(atBlock);
        return typeof index === "number" ? listValue[index] ?? null : null;
      }

      case "variables_get": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        return symbol?.value ?? null;
      }

      case "math_add": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "number" && typeof right === "number" ? left + right : null;
      }

      case "math_subtract": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "number" && typeof right === "number" ? left - right : null;
      }

      case "math_multiply": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "number" && typeof right === "number" ? left * right : null;
      }

      case "math_divide": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        if (typeof left !== "number" || typeof right !== "number" || right === 0) {
          return null;
        }
        return left / right;
      }

      case "logic_not": {
        const value = this.inferValue(block.getInputTargetBlock("A"));
        return typeof value === "boolean" ? !value : null;
      }

      case "logic_and": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "boolean" && typeof right === "boolean" ? left && right : null;
      }

      case "logic_or": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "boolean" && typeof right === "boolean" ? left || right : null;
      }

      case "logic_less": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "number" && typeof right === "number" ? left < right : null;
      }

      case "logic_greater": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return typeof left === "number" && typeof right === "number" ? left > right : null;
      }

      case "logic_equals": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        return left !== null && right !== null ? left === right : null;
      }

      default:
        return null;
    }
  }

  private addIssue(block: Blockly.Block, message: string, severity: Severity = "error") {
    if (!this.errors.has(block.id)) {
      this.errors.set(block.id, []);
    }

    this.errors.get(block.id)!.push({ message, severity });
  }

  private renderWarnings(workspace: Blockly.Workspace) {
    this.errors.forEach((issues, blockId) => {
      const block = workspace.getBlockById(blockId);
      if (!block) return;

      const formatted = issues.map(issue => {
        switch (issue.severity) {
          case "error":
            return `❌ ${issue.message}`;
          case "warning":
            return `⚠️ ${issue.message}`;
          case "suggestion":
            return `💡 ${issue.message}`;
        }
      });

      block.setWarningText(formatted.join("\n"));
    });
  }
}
