import type { ArduinoSemanticAnalyzer } from "../arduinoSemanticAnalyzer";
import { SymbolTable, type VarType } from "../symbolTable";
import * as Blockly from "blockly";
export class Conditions{
    private symbolTable: SymbolTable;
    private arduinoSemantic: ArduinoSemanticAnalyzer;
    constructor(symbolTable: SymbolTable, arduinoSemantic: ArduinoSemanticAnalyzer){
        this.symbolTable=symbolTable;
        this.arduinoSemantic=arduinoSemantic;
    }
    private getSymbolTable(): SymbolTable{
        return this.symbolTable;
    }
    private getArduinoSemantic(): ArduinoSemanticAnalyzer{
        return this.arduinoSemantic;
    }
    public handleIf(block:Blockly.Block,type: VarType){
        const conditionBlock=block.getInputTargetBlock("IF0");
        if(!conditionBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del IF está vacía",
                "warning"
            )
        }else{
            if(type!=="boolean"){
                this.arduinoSemantic.addIssuePublic(
                    block,
                    "La condición del IF debe ser booleana",
                    "error"
                )
            }    // 
        }
        const doBlock=block.getInputTargetBlock("DO0") || block.getInputTargetBlock("DO");
        if(!doBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "El cuerpo del IF está vacío",
                "error"
            )
            return false;
        }; 
        try{
            this.getSymbolTable().enterScope();
            this.getArduinoSemantic().visitPublic(doBlock);
            return true;
            
        }catch(err){
            console.log("Error en el handleIf",err)
            return false;
        }finally{
            this.getSymbolTable().exitScope();
        }
    }
    public handleIfElse(block: Blockly.Block,type: VarType){
        if(type!=="boolean"){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del IF debe ser booleana",
                "error"
            )
            return false;
        }
        try{
            const doBlock=block.getInputTargetBlock("DO0")
            const doElse=block.getInputTargetBlock("ELSE")
            if(!doBlock && doElse) return false;
            if(doBlock){
                this.getSymbolTable().enterScope();
                this.getArduinoSemantic().visitPublic(doBlock);
                this.getSymbolTable().exitScope();
            }
            if(doElse){
                this.getSymbolTable().enterScope();
                this.getArduinoSemantic().visitPublic(doElse);
                this.getSymbolTable().exitScope();
            }
            return true;
        }catch(err){
            console.log("Error en el handleIfElse",err)
        }

    }
    public handleWhile(block:Blockly.Block,type: VarType){
        if(type!=="boolean"){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del WHILE debe ser booleana",
                "error"
            )
        }
        const doBlock=block.getInputTargetBlock("DO")
        if(!doBlock) return false;
        try{

            this.getSymbolTable().enterScope();
            this.getArduinoSemantic().visitPublic(doBlock);
            return true;
        }catch(err){
            console.log("Error en el handleWhile",err)
            return false;
        }finally{
            this.getSymbolTable().exitScope();
        }
    }
    public handleDoWhile(block:Blockly.Block){
        const doBlock=block.getInputTargetBlock("DO")
        if(!doBlock) return false;
        try{
            this.getSymbolTable().enterScope();
            this.getArduinoSemantic().visitPublic(doBlock);
            return true;
        }catch(err){
            console.log("Error en el handleDoWhile",err)
            return false;
        }finally{
            this.getSymbolTable().exitScope();
        }
    }
    public handleForRange(block:Blockly.Block,varName: string){
        try{
            this.getSymbolTable().enterScope();
            const declared=this.getSymbolTable().declare(varName,"number");
            if(!declared){
                this.getArduinoSemantic().addIssuePublic(
                    block,
                    `Variable duplicada en FOR: ${varName}`,
                    "error"
                )
            }
            this.getSymbolTable().assign(varName,"number");
            const doBlock=block.getInputTargetBlock("DO")
            if(!doBlock) return;
            this.getArduinoSemantic().visitPublic(doBlock);
            this.getSymbolTable().exitScope();
        }catch(err){
            console.log("Error en el handleForRange",err)
        }
    }
}