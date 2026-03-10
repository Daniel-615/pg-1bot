import * as Blockly from "blockly";
import { SymbolTable } from "./symbolTable";
import type { VarType } from "./symbolTable";
import { Variables } from "./variables/variables";
import { Conditions } from "./conditions/conditions";
type Severity = "error" | "warning" | "suggestion";

interface Issue {
  message: string;
  severity: Severity;
}

export class ArduinoSemanticAnalyzer {

  private symbolTable!: SymbolTable;
  private variables!: Variables
  private conditions!: Conditions
  private errors!: Map<string, Issue[]>;

  private debugMode = false;
  private blocksQueue: Blockly.Block[] = [];
  private history: any[] = [];
  private currentIndex = 0;


  analyze(workspace: Blockly.Workspace) {
    this.debugMode = false;

    this.symbolTable = new SymbolTable();
    this.variables= new Variables(this.symbolTable,this);
    this.conditions= new Conditions(this.symbolTable,this);
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
    this.variables= new Variables(this.symbolTable,this);
    this.errors = new Map();
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

    (block as any).select?.();

    this.visit(block);

    this.history.push(this.symbolTable.cloneState());

    console.log("Estado actual tabla:", this.symbolTable.getFinalState());

    this.currentIndex++;
  }
  //gets
  getHistory() {
    return this.history;
  }

  getCurrentSymbolState() {
    return this.symbolTable.getFinalState();
  }
  getVariables(){
    return this.variables;
  }
  getConditions(){
    return this.conditions;
  }
  public visitPublic(block: Blockly.Block | null){
    this.visit(block);
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
        const ok=this.handleIf(block);
        if(!ok) return;
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
    if(!inferred) return;
    this.getVariables().checkOrDeclareVariable(name,inferred,block);
  }
  private checkUnusedVariables(workspace: Blockly.Workspace) {
    this.getVariables().checkUnusedVariables(workspace);
  }
  private handleVariableUse(block: Blockly.Block) {
    this.getVariables().handleVariableUse(block);
  }

  private handleIf(block: Blockly.Block) {
    try{
      const condition = block.getInputTargetBlock("CONDITION");
      const type = this.inferType(condition);
      const ok=this.getConditions().handleIf(block,type);
      return ok ?? false;
    }catch(err){
      console.log("Error en handleIf",err)
    }
  }

  private handleIfElse(block: Blockly.Block) {

    const condition = block.getInputTargetBlock("CONDITION");
    const type = this.inferType(condition);
    const ok=this.getConditions().handleIfElse(block, type);
    if(!ok) return;
  }

  private handleWhile(block: Blockly.Block) {

    const condition = block.getInputTargetBlock("BOOLEAN") || block.getInputTargetBlock("BOOL");
    const type = this.inferType(condition);

    const val=this.getConditions().handleWhile(block,type)
    if(!val) return;
  }

  private handleDoWhile(block: Blockly.Block) {
    const val=this.getConditions().handleDoWhile(block)
    if(!val){
      return;
    }
    const condition = block.getInputTargetBlock("BOOL");
    const type = this.inferType(condition);

    if (type !== "boolean") {
      this.addIssue(block, "La condición del mientras debe ser true/false", "error");
    }
  }

  private handleForRange(block: Blockly.Block) {

    const varName = block.getFieldValue("VAR");

    const fromType = this.inferType(block.getInputTargetBlock("FROM"));
    const toType = this.inferType(block.getInputTargetBlock("TO"));

    if (fromType !== "number" || toType !== "number") {
      this.addIssue(block, "Los valores del 'mientras' deben ser numéricos", "error");
    }

    this.getConditions().handleForRange(block,varName)
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
  public addIssuePublic(block: Blockly.Block, message: string, severity: Severity){
    this.addIssue(block,message,severity);
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