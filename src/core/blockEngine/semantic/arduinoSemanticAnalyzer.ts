import * as Blockly from "blockly";
import { SymbolTable } from "./symbolTable";
import type { VarType } from "./symbolTable";
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
  private history: any[] = [];
  private currentIndex = 0;

  analyze(workspace: Blockly.Workspace) {
    this.debugMode = false;
    this.symbolTable = new SymbolTable();
    this.variables= new Variables(this.symbolTable,this);
    this.conditions= new Conditions(this.symbolTable,this);
    this.operators= new Operators(this);
    this.errors = new Map();

    workspace.getAllBlocks(false).forEach(block=>{
      block.setWarningText(null);
    })
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

      //math operators
      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide": 
        this.handleOperatorMath(block);
        this.handleCheckUnusedExpression(block);
      if(block.type==="math_add"){
        this.handleVariablePlusZero(block);
      }
      if(block.type==="math_subtract"){
        this.handleSubtractOperator(block);
        this.handleVariableSubtractZero(block);
      }
      if(block.type==="math_multiply"){
        this.handleMultiply(block);
      }
      if(block.type==="math_divide"){
        this.handleDivide(block);
      }
      break;
      //logic operators
      case "logic_and":
      case "logic_or":
      case "logic_not":
      case "logic_less":
      case "logic_equals":
        this.handleOperatorLogic(block);
        break;
    }


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
  private handleVariableSubtractZero(block:Blockly.Block){
    const A=block.getInputTargetBlock("A");
    const B=block.getInputTargetBlock("B");
    if(!A || !B) return;
    this.operators.handleVariableSubtractZero(block,A,B);
  }
  private handleSubtractOperator(block:Blockly.Block){
    const A=block.getInputTargetBlock("A");
    const B=block.getInputTargetBlock("B");
    if(!A || !B){
      console.log("HandleSubtractOperator A o B se encuentran vacíos.")
      return;
    }
    this.operators.handleSubtract(block,A, B)
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
  private handleMultiply(block:Blockly.Block){
    const A=block.getInputTargetBlock("A");
    const B= block.getInputTargetBlock("B");
    if(!A||!B) return;
    this.operators.handleMultiply(block,A,B);
  }
  private handleDivide(block:Blockly.Block){
    const B= block.getInputTargetBlock("B");
    const A= block.getInputTargetBlock("A");
    if(!A||!B) return;
    this.operators.handleDivide(block,A,B)
  }
  private handleVariablePlusZero(block:Blockly.Block){
    const A=block.getInputTargetBlock("A");
    const B=block.getInputTargetBlock("B");
    if(!A || !B) return;
    this.operators.handleVariablePlusZero(block,A,B);
  }
  private handleCheckUnusedExpression(block:Blockly.Block){
    this.operators.checkUnusedExpression(block);
  }
  private handleOperatorMath(block: Blockly.Block){
    const A= block.getInputTargetBlock("A");
    const B= block.getInputTargetBlock("B");
    if(!A || !B) return;
    const typeA=this.inferType(A);
    const typeB=this.inferType(B);

    switch(block.type){
      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide":
        if(typeA!=="number" || typeB !== "number"){
          this.addIssue(
            block,
            "Los operadores matemáticos requieren valores numéricos",
            "warning"
          )
        }
        if(block.type === "math_divide"){
          if(B?.type === "math_number"){
            const value = Number(B.getFieldValue("NUM"));
            if(value === 0){
              this.addIssue(
                block,
                "No se puede realizar una división por cero",
                "error"
              );
            }
          }
        }
        break;
    }
  }
  private handleOperatorLogic(block: Blockly.Block){
    const A=block.getInputTargetBlock("A");
    const B=block.getInputTargetBlock("B");

    const typeA= this.inferType(A);
    const typeB= this.inferType(B);
    switch(block.type){
      case "logic_and":
      case "logic_or":
        if(typeA!=="boolean" || typeB!=="boolean"){
          this.addIssue(block,
            "Los operadores AND/OR deben usar valores booleanos",
            "error"
          )
        }
        break;
      case "logic_not":
        if(typeA!=="boolean"){
          this.addIssue(
            block,
            "El operador NOT solo funciona con booleanos",
            "error"
          )
        }
        break;
      case "logic_greater":
      case "logic_less":
        if(typeA!=="number" || typeB !=="number"){
          this.addIssue(
            block,
            "Las comparaciones < y > deben usar números ",
            "warning"
          );
        }
        break;
      case "logic_equals":
        if(typeA!==typeB){
          this.addIssue(block,
            "Estás comparando valores de distinto tipo",
            "suggestion"
          )
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

      case "variables_get":
        const symbol = this.symbolTable.lookup(block.getFieldValue("VAR"));
        return symbol?.type ?? null;

      default:
        return null;
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