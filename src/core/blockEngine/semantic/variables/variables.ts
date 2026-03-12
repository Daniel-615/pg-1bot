import type { ArduinoSemanticAnalyzer } from "../arduinoSemanticAnalyzer";
import { SymbolTable, type VarType } from "../symbolTable";
import * as Blockly from "blockly";

export class Variables {
    private symbolTable: SymbolTable;
    private arduinoSemantic: ArduinoSemanticAnalyzer;

    constructor(symbolTable: SymbolTable, arduinoSemantic: ArduinoSemanticAnalyzer) {
        this.symbolTable = symbolTable;
        this.arduinoSemantic = arduinoSemantic;
    }


    private getSymbolTable(): SymbolTable {
        return this.symbolTable;
    }

    private getArduinoSemantic(): ArduinoSemanticAnalyzer {
        return this.arduinoSemantic;
    }

    public handleVariableUse(block: Blockly.Block) {
        const name = block.getFieldValue("VAR");
        if (!name) return;

        const symbol = this.getSymbolTable().use(name);
        if (!symbol) {
            this.getArduinoSemantic().addIssuePublic(block, `Variable no declarada`, "error");
        } else if (!symbol.initialized) {
            this.getArduinoSemantic().addIssuePublic(block, `Variable no inicializada`, "error");
        }
    }

    public checkOrDeclareVariable(name: string | null, inferredType: VarType, block: Blockly.Block): void {
        if (!name) return;

        const symbol = this.getSymbolTable().lookup(name);
        if (!symbol) {
            const success = this.getSymbolTable().declare(name, inferredType);
            if (!success) {
                this.getArduinoSemantic().addIssuePublic(block, `Variable duplicada: ${name}`, "error");
            }
            return;
        }

        if (symbol.type && inferredType && symbol.type !== inferredType) {
            this.getArduinoSemantic().addIssuePublic(
                block,
                `Tipo incompatible. Esperado: ${symbol.type}, recibido: ${inferredType}`,
                "error"
            );
        }

        this.getSymbolTable().assign(name, inferredType);
    }

    public checkUnusedVariables(workspace: Blockly.Workspace) {
        const scopes = this.getSymbolTable().getFinalState();
        scopes.forEach(scope => {
            scope.forEach(symbol => {
                if (!symbol.used) {
                    const block = workspace.getAllBlocks(false).find(
                        b => b.type === "variables_set" && b.getFieldValue("VAR") === symbol.name
                    );
                    if (block) {
                        this.getArduinoSemantic().addIssuePublic(
                            block,
                            `Variable declarada pero no utilizada`,
                            "warning"
                        );
                    }
                }
            });
        });
    }
}