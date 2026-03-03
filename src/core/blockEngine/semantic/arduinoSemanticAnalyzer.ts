import * as Blockly from "blockly";
import { SymbolTable } from "./symbolTable";
import type { VarType } from "./symbolTable";

type Severity = "error" | "warning" | "suggestion";

interface Issue {
  message: string;
  severity: Severity;
}

export class ArduinoSemanticAnalyzer {

  private symbolTable!: SymbolTable;
  private errors!: Map<string, Issue[]>;

  private debugMode = false;
  private blocksQueue: Blockly.Block[] = [];
  private history: any[] = [];
  private currentIndex = 0;


  analyze(workspace: Blockly.Workspace) {
    this.debugMode = false;

    this.symbolTable = new SymbolTable();
    this.errors = new Map();

    const topBlocks = workspace.getTopBlocks(true);

    for (const block of topBlocks) {
      this.visit(block);
    }

    this.checkUnusedVariables(workspace);
    this.renderWarnings(workspace);
  }


  startDebug(workspace: Blockly.Workspace) {
    this.debugMode = true;

    this.symbolTable = new SymbolTable();
    this.errors = new Map();

    this.blocksQueue = [];
    this.history = [];
    this.currentIndex = 0;

    const topBlocks = workspace.getTopBlocks(true);
    this.blocksQueue.push(...topBlocks);
  }

  step(workspace: Blockly.Workspace) {

    if (this.currentIndex >= this.blocksQueue.length) {
      console.log("✅ Fin del análisis");
      this.checkUnusedVariables(workspace);
      this.renderWarnings(workspace);
      return;
    }

    const block = this.blocksQueue[this.currentIndex];

    (block as any).select?.();

    this.visit(block);

    this.history.push(this.symbolTable.cloneState());

    console.log("Estado actual tabla:", this.symbolTable.getFinalState());

    this.currentIndex++;
  }

  getHistory() {
    return this.history;
  }

  getCurrentSymbolState() {
    return this.symbolTable.getFinalState();
  }


  private visit(block: Blockly.Block | null) {
    if (!block) return;

    block.setWarningText(null);

    switch (block.type) {

      case "variables_set":
        this.handleAssignment(block);
        break;

      case "variables_get":
        this.handleVariableUse(block);
        break;

      case "if":
        this.handleIf(block);
        break;

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
    }

    this.checkDivisionByZero(block);

    if (this.debugMode) {

      block.inputList.forEach(input => {
        const child = input.connection?.targetBlock();
        if (child) this.blocksQueue.push(child);
      });

      const next = block.getNextBlock();
      if (next) this.blocksQueue.push(next);

    } else {

      block.inputList.forEach(input => {
        const child = input.connection?.targetBlock();
        if (child) this.visit(child);
      });

      this.visit(block.getNextBlock());
    }
  }


  private handleAssignment(block: Blockly.Block) {

    const name = block.getFieldValue("VAR");
    const valueBlock = block.getInputTargetBlock("VALUE");

    const inferred = this.inferType(valueBlock);
    const symbol = this.symbolTable.lookup(name);

    if (!symbol) {

      const success = this.symbolTable.declare(name, inferred);

      if (!success) {
        this.addIssue(block, `Variable duplicada: ${name}`, "error");
        return;
      }

    } else {

      if (symbol.type && inferred && symbol.type !== inferred) {
        this.addIssue(
          block,
          `Tipo incompatible. Esperado: ${symbol.type}, recibido: ${inferred}`,
          "error"
        );
      }
    }

    this.symbolTable.assign(name, inferred);
  }
  private checkUnusedVariables(workspace: Blockly.Workspace) {

    const scopes = this.symbolTable.getFinalState();

    scopes.forEach(scope => {
      scope.forEach(symbol => {

        if (!symbol.used) {

          const block = workspace.getAllBlocks(false).find(
            b =>
              b.type === "variables_set" &&
              b.getFieldValue("VAR") === symbol.name
          );

          if (block) {
            this.addIssue(
              block,
              `Variable declarada pero no utilizada: ${symbol.name}`,
              "warning"
            );
          }
        }
      });
    });
  }
  private handleVariableUse(block: Blockly.Block) {

    const name = block.getFieldValue("VAR");
    const symbol = this.symbolTable.use(name);

    if (!symbol) {
      this.addIssue(block, `Variable no declarada: ${name}`, "error");
    } else if (!symbol.initialized) {
      this.addIssue(block, `Variable no inicializada: ${name}`, "error");
    }
  }

  private handleIf(block: Blockly.Block) {

    const condition = block.getInputTargetBlock("IF0");
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del IF debe ser booleana", "error");
    }

    this.symbolTable.enterScope();
    this.visit(block.getInputTargetBlock("DO0"));
    this.symbolTable.exitScope();
  }

  private handleIfElse(block: Blockly.Block) {

    const condition = block.getInputTargetBlock("IF0");
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del IF debe ser booleana", "error");
    }

    this.symbolTable.enterScope();
    this.visit(block.getInputTargetBlock("DO0"));
    this.symbolTable.exitScope();

    this.symbolTable.enterScope();
    this.visit(block.getInputTargetBlock("ELSE"));
    this.symbolTable.exitScope();
  }

  private handleWhile(block: Blockly.Block) {

    const condition = block.getInputTargetBlock("BOOL");
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del WHILE debe ser booleana", "error");
    }

    this.symbolTable.enterScope();
    this.visit(block.getInputTargetBlock("DO"));
    this.symbolTable.exitScope();
  }

  private handleDoWhile(block: Blockly.Block) {

    this.symbolTable.enterScope();
    this.visit(block.getInputTargetBlock("DO"));
    this.symbolTable.exitScope();

    const condition = block.getInputTargetBlock("BOOL");
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del DO-WHILE debe ser booleana", "error");
    }
  }

  private handleForRange(block: Blockly.Block) {

    const varName = block.getFieldValue("VAR");

    const fromType = this.inferType(block.getInputTargetBlock("FROM"));
    const toType = this.inferType(block.getInputTargetBlock("TO"));

    if (fromType !== "number" || toType !== "number") {
      this.addIssue(block, "Los valores del FOR deben ser numéricos", "error");
    }

    this.symbolTable.enterScope();

    const declared = this.symbolTable.declare(varName, "number");

    if (!declared) {
      this.addIssue(block, `Variable duplicada en FOR: ${varName}`, "error");
    }

    this.symbolTable.assign(varName, "number");

    this.visit(block.getInputTargetBlock("DO"));

    this.symbolTable.exitScope();
  }


  private inferType(block: Blockly.Block | null): VarType {

    if (!block) return null;

    switch (block.type) {

      case "math_number":
      case "math_arithmetic":
        return "number";

      case "logic_boolean":
      case "logic_compare":
      case "logic_operation":
      case "logic_negate":
        return "boolean";

      case "text":
        return "string";

      case "variables_get":
        const symbol = this.symbolTable.lookup(block.getFieldValue("VAR"));
        return symbol?.type ?? null;

      default:
        return null;
    }
  }


  private checkDivisionByZero(block: Blockly.Block) {

    if (block.type !== "math_arithmetic") return;

    if (block.getFieldValue("OP") === "DIVIDE") {

      const divisor = block.getInputTargetBlock("B");

      if (
        divisor?.type === "math_number" &&
        divisor.getFieldValue("NUM") === "0"
      ) {
        this.addIssue(block, "División por cero", "error");
      }
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
          case "error": return `❌ ${issue.message}`;
          case "warning": return `⚠️ ${issue.message}`;
          case "suggestion": return `💡 ${issue.message}`;
        }
      });

      block.setWarningText(formatted.join("\n"));
    });
  }
}