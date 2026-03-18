import type { ArduinoSemanticAnalyzer } from "../arduinoSemanticAnalyzer";
import * as Blockly from "blockly";
export class Operators{
    private arduinoSemantic: ArduinoSemanticAnalyzer;
    constructor(arduinoSemantic: ArduinoSemanticAnalyzer){
        this.arduinoSemantic=arduinoSemantic;
    }
    private getArduinoSemantic(): ArduinoSemanticAnalyzer{
        return this.arduinoSemantic;
    }
    public handleSubtract(block:Blockly.Block, A: Blockly.Block, B: Blockly.Block){
        try{
            if(A?.type ==="number" && B?.type==="number"){
                const valueA= Number(A.getFieldValue("NUM"));
                const valueB=Number(B.getFieldValue("NUM"));
                if(valueA < valueB){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "El resultado de la resta será negativo",
                        "warning"
                    )
                }
            }
        }catch(err){
            console.log("Error en handleSubtract: ",err)
        }
    }
    public handleDivide(block:Blockly.Block,A:Blockly.Block, B: Blockly.Block){
        try{

            if(B?.type==="number"){
                const valueB= Number(B.getFieldValue("NUM"));
                if(valueB===1){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Dividir por 1 no cambia su valor",
                        "suggestion"
                    )
                }
                if(valueB === 0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "No se puede realizar una división por cero",
                        "error"
                    )
                }
            }
            if(A?.type=="variables_get" && B?.type==="variables_get"){
                const varA=this.getArduinoSemantic().getVariableName(A);
                const varB=this.getArduinoSemantic().getVariableName(B);
                if(varA===varB){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Dividir una variable por sí misma siempre da 1",
                        "suggestion"
                    )
                }
            }
        }catch(err){
            console.log("Error en handleDivideZero: ",err)
        }
    }
    public handleVariablePlusZero(block: Blockly.Block, A: Blockly.Block, B: Blockly.Block){
        try{
            if(A?.type==="number" && B?.type==="number"){
                const valueA=Number(A.getFieldValue("NUM"));
                const valueB=Number(B.getFieldValue("NUM"));
                if(valueA===0 && valueB===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Sumar 0 a 0 no cambia su valor",
                        "suggestion"
                    )
                }
            }
            if(A?.type==="variables_get" && B?.type==="number"){
                const valueB=Number(B.getFieldValue("NUM"));
                if(valueB===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Sumar 0 a una variable no cambia su valor",
                        "suggestion"
                    )
                }
            }
            
            if(A?.type==="number" && B?.type==="variables_get"){
                const valueA= Number(A.getFieldValue("NUM"));
                if(valueA===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Sumar 0 a una variable no cambia su valor",
                        "suggestion"
                    )
                }
            }
        }catch(err){
            console.log("Error en handleVariablePlusZero: ",err)
        }

    }
    public handleMultiply(block:Blockly.Block,A: Blockly.Block, B:Blockly.Block){
        try{
            if(B?.type==="number"){
                const valueB=Number(B.getFieldValue("NUM"));
                const valueA=Number(A.getFieldValue("NUM"));

                if(valueB===0 || valueA===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Multiplicar por 0 siempre da 0",
                        "suggestion"
                    )
                }
                if(valueB===1 || valueA===1){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Multiplicar con 1 siempre da su mismo valor",
                        "suggestion"
                    )
                }
            }
        }catch(err){
            console.log("Error en handleMultiply: ",err)
        }

    }
    public handleVariableSubtractZero(block: Blockly.Block, A: Blockly.Block, B: Blockly.Block){
        try{
            if(A?.type==="number" && B?.type==="number"){
                const valueA=Number(A.getFieldValue("NUM"));
                const valueB=Number(B.getFieldValue("NUM"));
                if(valueA===0 && valueB===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Restar 0 con 0 no cambia su valor",
                        "suggestion"
                    )
                }
            }
            if(A?.type==="variables_get" && B?.type==="number"){
                const valueB=Number(B.getFieldValue("NUM"));
                if(valueB===0){
                    this.getArduinoSemantic().addIssuePublic(
                        block,
                        "Restar 0 a una variable no cambia su valor",
                        "suggestion"
                    )
                }
            }
        }catch(err){
            console.log("Error en handleVariablePlusZero: ",err)
        }
    }
    public checkUnusedExpression(block:Blockly.Block){
        if(block.outputConnection && !block.outputConnection.targetConnection){
            this.getArduinoSemantic().addIssuePublic(
                block,
                "El resultado de esta expresión no se utiliza",
                "warning"   
            )
        }
    }
}
