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
        const conditionBlock=block.getInputTargetBlock("CONDITION");
        if(!conditionBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del si está vacía",
                "warning"
            )
        }else{
            if(type!=="boolean"){
                this.arduinoSemantic.addIssuePublic(
                    block,
                    "La condición del si debe ser booleana",
                    "error"
                )
            }    
        }
        const ifBody=block.getInputTargetBlock("IF_BODY")
        if(!ifBody){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "El cuerpo del si está vacío",
                "error"
            )
            return false;
        }; 
        try{
            this.getSymbolTable().enterScope();
            this.getArduinoSemantic().visitPublic(ifBody);
            return true;
            
        }catch(err){
            console.log("Error en el handleIf",err)
            return false;
        }finally{
            this.getSymbolTable().exitScope();
        }
    }
    public handleIfElse(block: Blockly.Block,type: VarType){
        const conditionBlock=block.getInputTargetBlock("CONDITION");
        if(!conditionBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del si está vacía",
                "warning"
            )
        }else{
            if(type!=="boolean"){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del si debe ser booleana",
                "error"
            )
            return false;
            }
        }
        try{
            const doBlock=block.getInputTargetBlock("IF_BODY")
            if(!doBlock){
                this.getArduinoSemantic().addIssuePublic(
                block,
                "El cuerpo del entonces está vacío.",
                "error"
                )
            }
            const doElse=block.getInputTargetBlock("ELSE_BODY")
            if(!doElse){
                this.getArduinoSemantic().addIssuePublic(
                    block,
                    "El cuerpo del sino está vacío",
                    "warning"
                )
            }
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
        const condition=block.getInputTargetBlock("CONDITION")
        if(!condition){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición del mientras está vacía.",
                "error"
            )
        }else{
            if(type!=="boolean"){
                this.getArduinoSemantic().addIssuePublic(
                    block,
                    "La condición del mientras debe ser booleana",
                    "error"
                )
            }
        }
        const doBlock=block.getInputTargetBlock("BODY")
        if(!doBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "El cuerpo del mientras está vacío",
                "error"
            )
        }
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
        const doBlock=block.getInputTargetBlock("BODY")
        if(!doBlock){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "El cuerpo de hacer no debe estar vacío.",
                "error"
            )
        }
        const condition=block.getInputTargetBlock("CONDITION")
        if(!condition){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "La condición de mientras no debe estar vacía.",
                "error"
            )
        }
        if(!doBlock || !condition) return false;
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
        const from=block.getInputTargetBlock("FROM");
        if(!from){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "'de' debe llevar un entero",
                "warning"
            )
        }
        const to=block.getInputTargetBlock("TO");
        if(!to){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "'to' debe llevar un entero",
                "warning"
            )
        }
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
            const doBlock=block.getInputTargetBlock("BODY")
            if(!doBlock){
                this.getArduinoSemantic().addIssuePublic(
                    block,
                    "el cuerpo de 'hacer' no debe estar vacío.",
                    "error"
                )
                return;  
            } 
            this.getArduinoSemantic().visitPublic(doBlock);
            this.getSymbolTable().exitScope();
        }catch(err){
            console.log("Error en el handleForRange",err)
        }
    }
}