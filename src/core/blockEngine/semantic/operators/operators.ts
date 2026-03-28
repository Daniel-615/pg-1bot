import type { ArduinoSemanticAnalyzer } from "../arduinoSemanticAnalyzer";
import * as Blockly from "blockly";

export class Operators {
  private arduinoSemantic: ArduinoSemanticAnalyzer;

  constructor(arduinoSemantic: ArduinoSemanticAnalyzer) {
    this.arduinoSemantic = arduinoSemantic;
  }

  private getArduinoSemantic(): ArduinoSemanticAnalyzer {
    return this.arduinoSemantic;
  }

  public handleSubtract(block: Blockly.Block, a: Blockly.Block, b: Blockly.Block) {
    try {
      if (a?.type === "number" && b?.type === "number") {
        const valueA = Number(a.getFieldValue("NUM"));
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueA < valueB) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "El resultado de la resta será negativo",
            "warning"
          );
        }
      }
    } catch (err) {
      console.log("Error en handleSubtract:", err);
    }
  }

  public handleDivide(block: Blockly.Block, a: Blockly.Block, b: Blockly.Block) {
    try {
      if (b?.type === "number") {
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueB === 1) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Dividir por 1 no cambia su valor",
            "suggestion"
          );
        }
        if (valueB === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "No se puede realizar una división por cero",
            "error"
          );
        }
      }

      if (a?.type === "variables_get" && b?.type === "variables_get") {
        const varA = this.getArduinoSemantic().getVariableName(a);
        const varB = this.getArduinoSemantic().getVariableName(b);
        if (varA === varB) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Dividir una variable por sí misma siempre da 1",
            "suggestion"
          );
        }
      }
    } catch (err) {
      console.log("Error en handleDivide:", err);
    }
  }

  public handleVariablePlusZero(block: Blockly.Block, a: Blockly.Block, b: Blockly.Block) {
    try {
      if (a?.type === "number" && b?.type === "number") {
        const valueA = Number(a.getFieldValue("NUM"));
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueA === 0 && valueB === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Sumar 0 a 0 no cambia su valor",
            "suggestion"
          );
        }
      }

      if (a?.type === "variables_get" && b?.type === "number") {
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueB === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Sumar 0 a una variable no cambia su valor",
            "suggestion"
          );
        }
      }

      if (a?.type === "number" && b?.type === "variables_get") {
        const valueA = Number(a.getFieldValue("NUM"));
        if (valueA === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Sumar 0 a una variable no cambia su valor",
            "suggestion"
          );
        }
      }
    } catch (err) {
      console.log("Error en handleVariablePlusZero:", err);
    }
  }

  public handleMultiply(block: Blockly.Block, a: Blockly.Block, b: Blockly.Block) {
    try {
      if (b?.type === "number") {
        const valueB = Number(b.getFieldValue("NUM"));
        const valueA = Number(a.getFieldValue("NUM"));

        if (valueB === 0 || valueA === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Multiplicar por 0 siempre da 0",
            "suggestion"
          );
        }
        if (valueB === 1 || valueA === 1) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Multiplicar con 1 siempre da su mismo valor",
            "suggestion"
          );
        }
      }
    } catch (err) {
      console.log("Error en handleMultiply:", err);
    }
  }

  public handleVariableSubtractZero(block: Blockly.Block, a: Blockly.Block, b: Blockly.Block) {
    try {
      if (a?.type === "number" && b?.type === "number") {
        const valueA = Number(a.getFieldValue("NUM"));
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueA === 0 && valueB === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Restar 0 con 0 no cambia su valor",
            "suggestion"
          );
        }
      }

      if (a?.type === "variables_get" && b?.type === "number") {
        const valueB = Number(b.getFieldValue("NUM"));
        if (valueB === 0) {
          this.getArduinoSemantic().addIssuePublic(
            block,
            "Restar 0 a una variable no cambia su valor",
            "suggestion"
          );
        }
      }
    } catch (err) {
      console.log("Error en handleVariableSubtractZero:", err);
    }
  }

  public checkUnusedExpression(block: Blockly.Block) {
    if (block.outputConnection && !block.outputConnection.targetConnection) {
      this.getArduinoSemantic().addIssuePublic(
        block,
        "El resultado de esta expresión no se utiliza",
        "warning"
      );
    }
  }
}
