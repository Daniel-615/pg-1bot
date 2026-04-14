import * as Blockly from "blockly";
import { SymbolTable } from "./base/symbolTable";
import type { SymbolTableRow, VarType } from "./base/symbolTable";
import { Variables } from "./base/variables/variables";
import { Conditions } from "./base/conditions/conditions";
import { Operators } from "./base/operators/operators";
import { CodeyRockySemantic } from "./codeyRocky/codeyRockySemantic";
import { translateSemanticMessage } from "./base/semanticI18n";
import { getBinaryInputs, getConditionBlock } from "./base/workspace/blockAccess";
import { WorkspaceTraversal } from "./base/workspace/workspaceTraversal";
import { WifiSemantic } from "./esp32/wifi/wifiSemantic";
import { DisplaySemantic } from "./esp32/display/displaySemantic";
import { LucesSemantic } from "./esp32/luces/lucesSemantic";
import { PinesEsp32Semantic } from "./esp32/pines/pinesEsp32Semantic";
import { SensoresEsp32Semantic } from "./esp32/sensores/sensoresEsp32Semantic";
import { PinesArduinoSemantic } from "./arduino/pines/pinesArduinoSemantic";
import { SensoresArduinoSemantic } from "./arduino/sensores/sensoresArduinoSemantic";
import { DatosArduinoSemantic } from "./arduino/datos/datosArduinoSemantic";
import { SerialArduinoSemantic } from "./arduino/serial/serialArduinoSemantic";

type Severity = "error" | "warning" | "suggestion";

interface Issue {
  message: string;
  severity: Severity;
}

export interface AnalyzerIssueRow {
  blockId: string;
  blockType: string;
  message: string;
  severity: Severity;
}

export class ArduinoSemanticAnalyzer {
  private symbolTable!: SymbolTable;
  private variables!: Variables;
  private conditions!: Conditions;
  private operators!: Operators;
  private errors!: Map<string, Issue[]>;
  private pinUsage!: Map<string, { mode: string; blockId: string }>;
  private codeyRocky!: CodeyRockySemantic;
  private wifiSemantic!: WifiSemantic;
  private displaySemantic!: DisplaySemantic;
  private lucesSemantic!: LucesSemantic;
  private pinesEsp32Semantic!: PinesEsp32Semantic;
  private sensoresEsp32Semantic!: SensoresEsp32Semantic;
  private pinesArduinoSemantic!: PinesArduinoSemantic;
  private sensoresArduinoSemantic!: SensoresArduinoSemantic;
  private datosArduinoSemantic!: DatosArduinoSemantic;
  private serialArduinoSemantic!: SerialArduinoSemantic;

  private debugMode = false;
  private blocksQueue: Blockly.Block[] = [];
  private history: Array<Map<string, unknown>[]> = [];
  private currentIndex = 0;

  private getTraversal() {
    return new WorkspaceTraversal({
      debugMode: this.debugMode,
      queueBlock: (block) => this.blocksQueue.push(block),
      visitBlock: (block) => this.visit(block),
    });
  }

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

  getIssueRows(workspace: Blockly.Workspace): AnalyzerIssueRow[] {
    const rows: AnalyzerIssueRow[] = [];

    this.errors.forEach((issues, blockId) => {
      const block = workspace.getBlockById(blockId);
      const blockType = block?.type ?? "unknown";

      issues.forEach((issue) => {
        rows.push({
          blockId,
          blockType,
          message: issue.message,
          severity: issue.severity,
        });
      });
    });

    return rows;
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
    this.pinUsage = new Map();
    this.codeyRocky = new CodeyRockySemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      inferValue: (block) => this.inferValue(block),
      handleCheckUnusedExpression: (block) => this.handleCheckUnusedExpression(block),
    });
    this.codeyRocky.reset();
    this.wifiSemantic = new WifiSemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      inferValue: (block) => this.inferValue(block),
    });
    this.wifiSemantic.reset();
    this.displaySemantic = new DisplaySemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
    });
    this.displaySemantic.reset();
    this.lucesSemantic = new LucesSemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      registerPinUsage: (block, pin, mode) => this.registerPinUsage(block, pin, mode),
    });
    this.lucesSemantic.reset();
    this.pinesEsp32Semantic = new PinesEsp32Semantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      registerPinUsage: (block, pin, mode) => this.registerPinUsage(block, pin, mode),
    });
    this.sensoresEsp32Semantic = new SensoresEsp32Semantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      registerPinUsage: (block, pin, mode) => this.registerPinUsage(block, pin, mode),
    });
    this.sensoresEsp32Semantic.reset();
    this.pinesArduinoSemantic = new PinesArduinoSemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      registerPinUsage: (block, pin, mode) => this.registerPinUsage(block, pin, mode),
      handleCheckUnusedExpression: (block) => this.handleCheckUnusedExpression(block),
    });
    this.pinesArduinoSemantic.reset();
    this.sensoresArduinoSemantic = new SensoresArduinoSemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      registerPinUsage: (block, pin, mode) => this.registerPinUsage(block, pin, mode),
      handleCheckUnusedExpression: (block) => this.handleCheckUnusedExpression(block),
    });
    this.datosArduinoSemantic = new DatosArduinoSemantic({
      addIssue: (block, message, severity) => this.addIssue(block, message, severity),
      inferValue: (block) => this.inferValue(block),
      handleCheckUnusedExpression: (block) => this.handleCheckUnusedExpression(block),
    });
    this.serialArduinoSemantic = new SerialArduinoSemantic({
      handleCheckUnusedExpression: (block) => this.handleCheckUnusedExpression(block),
    });
  }

  private registerPinUsage(
    block: Blockly.Block,
    pin: string,
    mode: "digital_output" | "digital_input" | "analog_input" | "pwm_output" | "touch_input" | "ultrasonic_trig" | "ultrasonic_echo" | "neopixel" | "servo_output" | "tone_output" | "pin_mode"
  ) {
    if (!pin) return;

    const current = this.pinUsage.get(pin);
    if (current && current.mode !== mode) {
      this.addIssue(
        block,
        `El pin ${pin} ya se usa como ${current.mode}. Revisa posibles conflictos de hardware.`,
        "warning"
      );
    }

    this.pinUsage.set(pin, { mode, blockId: block.id });
  }

  private visit(block: Blockly.Block | null) {
    if (!block) return;

    block.setWarningText(null);

    const boardHandlers = [
      this.codeyRocky,
      this.wifiSemantic,
      this.displaySemantic,
      this.lucesSemantic,
      this.pinesEsp32Semantic,
      this.sensoresEsp32Semantic,
      this.pinesArduinoSemantic,
      this.sensoresArduinoSemantic,
      this.datosArduinoSemantic,
      this.serialArduinoSemantic,
    ];

    for (const handler of boardHandlers) {
      if (handler.handleBlock(block)) {
        this.getTraversal().traverseChildren(block);
        return;
      }
    }

    switch (block.type) {
      case "variables_set":
      case "variables_set_dynamic":
        this.handleAssignment(block);
        break;

      case "variables_get":
      case "variables_get_dynamic":
      case "list_var_get_index":
        this.handleVariableUse(block);
        break;

      case "list_var_set_index":
        this.handleListSetIndex(block);
        break;

      case "if": {
        const ok = this.handleIf(block);
        if (!ok) {
          this.getTraversal().traverseControlBlock(block, ["CONDITION"]);
          return;
        }
        this.getTraversal().traverseControlBlock(block, ["CONDITION"]);
        return;
      }

      case "if_else":
        this.handleIfElse(block);
        this.getTraversal().traverseControlBlock(block, ["CONDITION"]);
        return;

      case "while_repeat":
        this.handleWhile(block);
        this.getTraversal().traverseControlBlock(block, ["CONDITION"]);
        return;

      case "do_while":
        this.handleDoWhile(block);
        this.getTraversal().traverseControlBlock(block, ["CONDITION"]);
        return;

      case "for_range":
        this.handleForRange(block);
        this.getTraversal().traverseControlBlock(block, ["FROM", "TO"]);
        return;

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
      case "logic_equal":
        this.handleOperatorLogic(block);
        break;
    }

    this.getTraversal().traverseChildren(block);
  }

  private handleVariableSubtractZero(block: Blockly.Block) {
    const { left, right } = getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleVariableSubtractZero(block, left, right);
  }

  private handleSubtractOperator(block: Blockly.Block) {
    const { left, right } = getBinaryInputs(block);
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
    this.symbolTable.assign(name, nextValue, symbol.type);
  }

  private handleIf(block: Blockly.Block) {
    try {
      const condition = getConditionBlock(block);
      const type = this.inferType(condition);
      const ok = this.getConditions().handleIf(block, type);
      return ok ?? false;
    } catch (err) {
      console.log("Error en handleIf", err);
    }
  }

  private handleIfElse(block: Blockly.Block) {
    const condition = getConditionBlock(block);
    const type = this.inferType(condition);
    const ok = this.getConditions().handleIfElse(block, type);
    if (!ok) return;
  }

  private handleWhile(block: Blockly.Block) {
    const condition = getConditionBlock(block);
    const type = this.inferType(condition);

    const ok = this.getConditions().handleWhile(block, type);
    if (!ok) return;
  }

  private handleDoWhile(block: Blockly.Block) {
    const ok = this.getConditions().handleDoWhile(block);
    if (!ok) {
      return;
    }

    const condition = getConditionBlock(block);
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
    const { left, right } = getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleMultiply(block, left, right);
  }

  private handleDivide(block: Blockly.Block) {
    const { left, right } = getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleDivide(block, left, right);
  }

  private handleVariablePlusZero(block: Blockly.Block) {
    const { left, right } = getBinaryInputs(block);
    if (!left || !right) return;

    this.operators.handleVariablePlusZero(block, left, right);
  }

  private handleCheckUnusedExpression(block: Blockly.Block) {
    this.operators.checkUnusedExpression(block);
  }

  private handleOperatorMath(block: Blockly.Block) {
    const { left, right } = getBinaryInputs(block);
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
    switch (block.type) {
      case "logic_and":
      case "logic_or":
        {
          const { left, right } = getBinaryInputs(block);
          const typeA = this.inferType(left);
          const typeB = this.inferType(right);
        const validLeft = typeA === "boolean" || typeA === "number";
        const validRight = typeB === "boolean" || typeB === "number";
        if (!validLeft || !validRight) {
          this.addIssue(block, "Los operadores AND/OR deben usar valores booleanos o numericos", "error");
        }

        const leftValue = this.inferValue(left);
        const rightValue = this.inferValue(right);
        const leftInvalidNumber = typeof leftValue === "number" && leftValue !== 0 && leftValue !== 1;
        const rightInvalidNumber = typeof rightValue === "number" && rightValue !== 0 && rightValue !== 1;

        if (leftInvalidNumber || rightInvalidNumber) {
          this.addIssue(block, "En operadores AND/OR los valores numericos solo deben ser 0 o 1", "error");
        }
        }
        break;

      case "logic_not":
        if (this.inferType(getConditionBlock(block)) !== "boolean") {
          this.addIssue(block, "El operador NOT solo funciona con booleanos", "error");
        }
        break;

      case "logic_greater":
      case "logic_less":
        {
          const { left, right } = getBinaryInputs(block);
          const typeA = this.inferType(left);
          const typeB = this.inferType(right);
        if (typeA !== "number" || typeB !== "number") {
          this.addIssue(block, "Las comparaciones < y > deben usar números ", "warning");
        }
        }
        break;

      case "logic_equal":
        {
          const { left, right } = getBinaryInputs(block);
          const typeA = this.inferType(left);
          const typeB = this.inferType(right);
        if (typeA !== typeB) {
          this.addIssue(block, "Estás comparando valores de distinto tipo", "suggestion");
        }
        }
        break;
    }
  }

  private inferType(block: Blockly.Block | null): VarType {
    if (!block) return null;

    const codeyType = this.codeyRocky.inferType(block);
    if (codeyType !== undefined) {
      return codeyType;
    }

    const arduinoDataType = this.datosArduinoSemantic.inferType(block);
    if (arduinoDataType !== undefined) {
      return arduinoDataType;
    }

    const arduinoSerialType = this.serialArduinoSemantic.inferType(block);
    if (arduinoSerialType !== undefined) {
      return arduinoSerialType;
    }

    switch (block.type) {
      case "number":
      case "math_number":
      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide":
      case "arduino_uno_digital_read":
      case "arduino_uno_analog_read":
      case "arduino_uno_pulse_in":
      case "esp32_digital_read":
      case "esp32_analog_read":
      case "esp32_touch_read":
      case "esp32_ultrasonic_distance":
      case "esp32_dht_temperature":
      case "esp32_dht_humidity":
      case "wifi_get_rssi":
        return "number";

      case "logic_boolean":
      case "logic_and":
      case "logic_or":
      case "logic_not":
      case "logic_less":
      case "logic_equal":
      case "logic_greater":
      case "wifi_is_connected":
      case "wifi_web_response_equals":
        return "boolean";

      case "string":
      case "json_object":
      case "wifi_local_ip":
      case "wifi_web_file_name":
      case "wifi_http_get_text":
      case "wifi_http_post_text":
        return "string";

      case "lists_create_empty":
      case "lists_repeat":
        return "array";

      case "lists_create_with": {
        const listBlock = block as Blockly.Block & { itemCount_?: number };
        const itemCount = listBlock.itemCount_ ?? 0;
        let hasStringItems = false;

        for (let index = 0; index < itemCount; index += 1) {
          const itemType = this.inferType(block.getInputTargetBlock(`ADD${index}`));
          if (itemType === "string") {
            hasStringItems = true;
            break;
          }
        }

        return hasStringItems ? "array_string" : "array";
      }

      case "wifi_scan_networks":
        return "array_string";

      case "lists_length":
        return "number";

      case "lists_getIndex": {
        const listBlock = block.getInputTargetBlock("VALUE");
        if (!listBlock) return null;

        if (listBlock.type === "string") {
          return "string";
        }

        const listType = this.inferType(listBlock);
        if (listType === "array_string") {
          return "string";
        }

        if (listBlock.type === "variables_get") {
          const symbol = this.symbolTable.lookup(this.getVariableName(listBlock) ?? "");
          if (symbol?.type === "array_string") {
            return "string";
          }
          return symbol?.type === "array" ? "number" : symbol?.type ?? null;
        }

        return "number";
      }

      case "list_var_get_index": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        if (!symbol) return null;
        if (symbol.type === "array_string") {
          return "string";
        }
        return symbol.type === "array" ? "number" : symbol.type;
      }

      case "variables_get":
      case "variables_get_dynamic": {
        const symbol = this.symbolTable.lookup(this.getVariableName(block) ?? "");
        return symbol?.type ?? null;
      }

      default:
        return null;
    }
  }

  private inferValue(block: Blockly.Block | null): unknown {
    if (!block) return null;

    const codeyValue = this.codeyRocky.inferValue(block);
    if (codeyValue.handled) {
      return codeyValue.value;
    }

    const arduinoDataValue = this.datosArduinoSemantic.inferValue(block);
    if (arduinoDataValue.handled) {
      return arduinoDataValue.value;
    }

    const arduinoSerialValue = this.serialArduinoSemantic.inferValue(block);
    if (arduinoSerialValue.handled) {
      return arduinoSerialValue.value;
    }

    switch (block.type) {
      case "number":
      case "math_number":
        return Number(block.getFieldValue("NUM"));

      case "logic_boolean":
        return block.getFieldValue("BOOL") === "TRUE";

      case "string":
        return block.getFieldValue("STRING");

      case "json_object": {
        const pairs: string[] = [];
        const jsonBlock = block as Blockly.Block & { itemCount_?: number };
        const itemCount = jsonBlock.itemCount_ ?? 1;

        for (let index = 0; index < itemCount; index += 1) {
          const key = block.getFieldValue(`KEY${index}`) || `campo${index + 1}`;
          const value = this.inferValue(block.getInputTargetBlock(`VALUE${index}`));
          pairs.push(`${JSON.stringify(key)}:${JSON.stringify(value ?? "")}`);
        }

        return `{${pairs.join(",")}}`;
      }

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

      case "variables_get":
      case "variables_get_dynamic": {
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
        const value = this.inferValue(getConditionBlock(block));
        return typeof value === "boolean" ? !value : null;
      }

      case "logic_and": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        const leftValid = typeof left === "boolean" || typeof left === "number";
        const rightValid = typeof right === "boolean" || typeof right === "number";
        return leftValid && rightValid ? Boolean(left) && Boolean(right) : null;
      }

      case "logic_or": {
        const left = this.inferValue(block.getInputTargetBlock("A"));
        const right = this.inferValue(block.getInputTargetBlock("B"));
        const leftValid = typeof left === "boolean" || typeof left === "number";
        const rightValid = typeof right === "boolean" || typeof right === "number";
        return leftValid && rightValid ? Boolean(left) || Boolean(right) : null;
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

      case "logic_equal": {
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

    this.errors.get(block.id)!.push({ message: translateSemanticMessage(message), severity });
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

