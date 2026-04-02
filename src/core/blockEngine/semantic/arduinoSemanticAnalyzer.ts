import * as Blockly from "blockly";
import { SymbolTable } from "./symbolTable";
import type { SymbolTableRow, VarType } from "./symbolTable";
import { Variables } from "./variables/variables";
import { Conditions } from "./conditions/conditions";
import { Operators } from "./operators/operators";
import { translateSemanticMessage } from "./semanticI18n";

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
  private hasNeoPixelInit!: boolean;
  private hasDisplayInit!: boolean;
  private hasDhtInit!: boolean;
  private hasWifiSetup!: boolean;
  private hasWebServerInit!: boolean;
  private pinUsage!: Map<string, { mode: string; blockId: string }>;
  private wifiMode!: "none" | "station" | "ap";
  private wifiConnected!: boolean;
  private attachedServoPins!: Set<string>;
  private neoPixelConfig!: string | null;
  private displayConfig!: string | null;
  private dhtConfig!: string | null;
  private webServerPort!: string | null;

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
    this.hasNeoPixelInit = false;
    this.hasDisplayInit = false;
    this.hasDhtInit = false;
    this.hasWifiSetup = false;
    this.hasWebServerInit = false;
    this.pinUsage = new Map();
    this.wifiMode = "none";
    this.wifiConnected = false;
    this.attachedServoPins = new Set();
    this.neoPixelConfig = null;
    this.displayConfig = null;
    this.dhtConfig = null;
    this.webServerPort = null;
  }

  private isEsp32InputOnlyPin(pin: string) {
    return ["34", "35", "36", "39"].includes(pin);
  }

  private isEsp32AdcPin(pin: string) {
    return [
      "0",
      "2",
      "4",
      "12",
      "13",
      "14",
      "15",
      "25",
      "26",
      "27",
      "32",
      "33",
      "34",
      "35",
      "36",
      "39",
    ].includes(pin);
  }

  private isEsp32TouchPin(pin: string) {
    return ["0", "2", "4", "12", "13", "14", "15", "27", "32", "33"].includes(pin);
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

  private traverseNextBlock(block: Blockly.Block) {
    const next = block.getNextBlock();
    if (!next) return;

    if (this.debugMode) {
      this.blocksQueue.push(next);
      return;
    }

    this.visit(next);
  }

  private traverseControlBlock(block: Blockly.Block, inputNames: string[]) {
    inputNames.forEach((inputName) => {
      const child = block.getInputTargetBlock(inputName);
      if (!child) return;

      if (this.debugMode) {
        this.blocksQueue.push(child);
      } else {
        this.visit(child);
      }
    });

    this.traverseNextBlock(block);
  }

  private visit(block: Blockly.Block | null) {
    if (!block) return;

    block.setWarningText(null);

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

      case "esp32_neopixel_init":
        {
          const config = `${block.getFieldValue("PIN")}:${block.getFieldValue("COUNT")}`;
          if (this.neoPixelConfig && this.neoPixelConfig !== config) {
            this.addIssue(
              block,
              "Ya inicializaste NeoPixel con otra configuracion. Usa una sola inicializacion por programa",
              "warning"
            );
          }
          this.neoPixelConfig = this.neoPixelConfig ?? config;
        }
        this.hasNeoPixelInit = true;
        this.registerPinUsage(block, block.getFieldValue("PIN"), "neopixel");
        break;

      case "esp32_neopixel_set_color":
      case "esp32_neopixel_set_rgb":
      case "esp32_neopixel_clear":
        if (!this.hasNeoPixelInit) {
          this.addIssue(
            block,
            "Debes inicializar la tira NeoPixel antes de controlar sus LEDs",
            "error"
          );
        }
        break;

      case "esp32_display_init":
        {
          const config = `${block.getFieldValue("SDA")}:${block.getFieldValue("SCL")}`;
          if (this.displayConfig && this.displayConfig !== config) {
            this.addIssue(
              block,
              "Ya inicializaste el display con otros pines. Usa una sola inicializacion por programa",
              "warning"
            );
          }
          this.displayConfig = this.displayConfig ?? config;
        }
        this.hasDisplayInit = true;
        break;

      case "esp32_display_print":
      case "esp32_display_clear":
        if (!this.hasDisplayInit) {
          this.addIssue(
            block,
            "Debes inicializar el display antes de mostrar o limpiar contenido",
            "error"
          );
        }
        break;

      case "wifi_connect":
        if (!block.getFieldValue("SSID")?.trim()) {
          this.addIssue(block, "El SSID no debería estar vacío", "suggestion");
        }
        if (!block.getFieldValue("PASSWORD")?.trim()) {
          this.addIssue(block, "La contraseña WiFi no debería estar vacía", "suggestion");
        } else if ((block.getFieldValue("PASSWORD") ?? "").trim().length < 8) {
          this.addIssue(block, "La contraseña WiFi debería tener al menos 8 caracteres", "warning");
        }
        if (this.wifiMode === "ap") {
          this.addIssue(
            block,
            "Ya configuraste un punto de acceso. Evita mezclar modo AP y conexion WiFi cliente en el mismo flujo",
            "warning"
          );
        }
        if (this.wifiConnected && this.wifiMode === "station") {
          this.addIssue(
            block,
            "Ya existe una conexion WiFi cliente previa en este flujo",
            "suggestion"
          );
        }
        this.hasWifiSetup = true;
        this.wifiMode = "station";
        this.wifiConnected = true;
        break;

      case "wifi_create_ap":
        if (!block.getFieldValue("SSID")?.trim()) {
          this.addIssue(block, "El SSID del punto de acceso no debería estar vacío", "suggestion");
        }
        if (!block.getFieldValue("PASSWORD")?.trim()) {
          this.addIssue(block, "La contraseña del punto de acceso no debería estar vacía", "suggestion");
        } else if ((block.getFieldValue("PASSWORD") ?? "").trim().length < 8) {
          this.addIssue(
            block,
            "La contraseña del punto de acceso debería tener al menos 8 caracteres",
            "warning"
          );
        }
        if (this.wifiMode === "station") {
          this.addIssue(
            block,
            "Ya configuraste una conexion WiFi cliente. Evita mezclar modo cliente y punto de acceso en el mismo flujo",
            "warning"
          );
        }
        if (this.wifiConnected && this.wifiMode === "ap") {
          this.addIssue(
            block,
            "Ya existe un punto de acceso configurado en este flujo",
            "suggestion"
          );
        }
        this.hasWifiSetup = true;
        this.wifiMode = "ap";
        this.wifiConnected = true;
        break;

      case "wifi_disconnect":
        if (!this.wifiConnected) {
          this.addIssue(
            block,
            "No puedes desconectar WiFi si antes no conectaste o creaste un punto de acceso",
            "error"
          );
        }
        this.wifiConnected = false;
        this.hasWebServerInit = false;
        break;

      case "wifi_start_web_server":
        if (this.webServerPort && this.webServerPort !== (block.getFieldValue("PORT") || "80")) {
          this.addIssue(
            block,
            "Ya iniciaste un servidor web en otro puerto. Usa un solo puerto por programa",
            "warning"
          );
        }
        if (!this.hasWifiSetup) {
          this.addIssue(
            block,
            "Conviene conectar WiFi o crear un punto de acceso antes de iniciar el servidor web",
            "warning"
          );
        }
        if (!this.wifiConnected) {
          this.addIssue(
            block,
            "No hay una conexion WiFi activa para iniciar el servidor web",
            "error"
          );
        }
        this.hasWebServerInit = true;
        this.webServerPort = this.webServerPort ?? (block.getFieldValue("PORT") || "80");
        break;

      case "wifi_get_rssi":
        if (this.wifiMode !== "station" || !this.wifiConnected) {
          this.addIssue(
            block,
            "La intensidad de señal solo esta disponible cuando hay una conexion WiFi cliente activa",
            "error"
          );
        }
        if (!this.hasWifiSetup) {
          this.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de consultar este dato",
            "error"
          );
        }
        break;

      case "wifi_local_ip":
        if (!this.hasWifiSetup) {
          this.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de consultar este dato",
            "error"
          );
        }
        if (!this.wifiConnected) {
          this.addIssue(
            block,
            "No hay una conexion WiFi activa para consultar este dato",
            "error"
          );
        }
        break;

      case "wifi_web_file_name":
      case "wifi_web_response_equals":
        if (!this.hasWebServerInit) {
          this.addIssue(
            block,
            "Debes iniciar el servidor web antes de consultar la ruta solicitada",
            "error"
          );
        }
        break;

      case "wifi_http_get_text":
      case "wifi_http_post_text":
        if (!this.hasWifiSetup || !this.wifiConnected) {
          this.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de hacer peticiones HTTP",
            "error"
          );
        }
        if (block.type === "wifi_http_post_text") {
          const contentTypeBlock = block.getInputTargetBlock("CONTENT_TYPE");
          const contentTypeValue = this.inferValue(contentTypeBlock);

          if (typeof contentTypeValue !== "string" || !contentTypeValue.trim()) {
            this.addIssue(
              block,
              "En content-type normalmente va algo como application/json o text/plain",
              "suggestion"
            );
          } else {
            const normalizedContentType = contentTypeValue.trim().toLowerCase();
            if (normalizedContentType === "post" || normalizedContentType === "get") {
              this.addIssue(
                block,
                "En content-type no va el metodo HTTP. Usa valores como application/json o text/plain",
                "warning"
              );
            }
          }
        }
        break;

      case "esp32_pin_mode": {
        const pin = block.getFieldValue("PIN");
        const mode = block.getFieldValue("MODE");
        if (mode === "OUTPUT" && this.isEsp32InputOnlyPin(pin)) {
          this.addIssue(
            block,
            `El pin ${pin} en ESP32 es solo de entrada y no puede configurarse como OUTPUT`,
            "error"
          );
        }
        this.registerPinUsage(block, pin, "pin_mode");
        break;
      }

      case "esp32_digital_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve como salida digital`,
            "error"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "digital_output");
        break;

      case "esp32_digital_read":
        this.registerPinUsage(block, block.getFieldValue("PIN"), "digital_input");
        break;

      case "esp32_analog_read":
        if (!this.isEsp32AdcPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} no suele ser valido para lectura analogica en ESP32`,
            "warning"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "analog_input");
        break;

      case "esp32_pwm_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para PWM`,
            "error"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "pwm_output");
        break;

      case "esp32_analog_write":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para salida analoga por PWM`,
            "error"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "pwm_output");
        break;

      case "esp32_touch_read":
        if (!this.isEsp32TouchPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} no tiene capacidad touch en ESP32`,
            "warning"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "touch_input");
        break;

      case "esp32_dht_init":
        {
          const config = `${block.getFieldValue("PIN")}:${block.getFieldValue("TYPE")}`;
          if (this.dhtConfig && this.dhtConfig !== config) {
            this.addIssue(
              block,
              "Ya inicializaste el sensor DHT con otra configuracion. Usa una sola inicializacion por programa",
              "warning"
            );
          }
          this.dhtConfig = this.dhtConfig ?? config;
        }
        this.hasDhtInit = true;
        break;

      case "esp32_dht_temperature":
      case "esp32_dht_humidity":
        if (!this.hasDhtInit) {
          this.addIssue(
            block,
            "Debes inicializar el sensor DHT antes de leer temperatura o humedad",
            "error"
          );
        }
        break;

      case "esp32_servo_attach": {
        const pin = block.getFieldValue("PIN");
        if (this.isEsp32InputOnlyPin(pin)) {
          this.addIssue(
            block,
            `El pin ${pin} en ESP32 es solo de entrada y no sirve para un servo`,
            "error"
          );
        }
        this.attachedServoPins.add(pin);
        this.registerPinUsage(block, pin, "servo_output");
        break;
      }

      case "esp32_servo_write": {
        const pin = block.getFieldValue("PIN");
        if (!this.attachedServoPins.has(pin)) {
          this.addIssue(
            block,
            "Debes conectar o inicializar el servo antes de moverlo",
            "error"
          );
        }
        this.registerPinUsage(block, pin, "servo_output");
        break;
      }

      case "esp32_tone_play":
      case "esp32_tone_stop":
        if (this.isEsp32InputOnlyPin(block.getFieldValue("PIN"))) {
          this.addIssue(
            block,
            `El pin ${block.getFieldValue("PIN")} en ESP32 es solo de entrada y no sirve para buzzer`,
            "error"
          );
        }
        this.registerPinUsage(block, block.getFieldValue("PIN"), "tone_output");
        break;

      case "esp32_ultrasonic_distance": {
        const trig = block.getFieldValue("TRIG");
        const echo = block.getFieldValue("ECHO");
        if (trig && echo && trig === echo) {
          this.addIssue(block, "TRIG y ECHO no deberían usar el mismo pin", "warning");
        }
        this.registerPinUsage(block, trig, "ultrasonic_trig");
        this.registerPinUsage(block, echo, "ultrasonic_echo");
        break;
      }

      case "if": {
        const ok = this.handleIf(block);
        if (!ok) {
          this.traverseControlBlock(block, ["CONDITION"]);
          return;
        }
        this.traverseControlBlock(block, ["CONDITION"]);
        break;
      }

      case "if_else":
        this.handleIfElse(block);
        this.traverseControlBlock(block, ["CONDITION"]);
        break;

      case "while_repeat":
        this.handleWhile(block);
        this.traverseControlBlock(block, ["CONDITION"]);
        break;

      case "do_while":
        this.handleDoWhile(block);
        this.traverseControlBlock(block, ["CONDITION"]);
        break;

      case "for_range":
        this.handleForRange(block);
        this.traverseControlBlock(block, ["FROM", "TO"]);
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

    if (["if", "if_else", "while_repeat", "do_while", "for_range"].includes(block.type)) {
      return;
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
    switch (block.type) {
      case "logic_and":
      case "logic_or":
        {
          const { left, right } = this.getBinaryInputs(block);
          const typeA = this.inferType(left);
          const typeB = this.inferType(right);
        if (typeA !== "boolean" || typeB !== "boolean") {
          this.addIssue(block, "Los operadores AND/OR deben usar valores booleanos", "error");
        }
        }
        break;

      case "logic_not":
        if (this.inferType(this.getConditionBlock(block)) !== "boolean") {
          this.addIssue(block, "El operador NOT solo funciona con booleanos", "error");
        }
        break;

      case "logic_greater":
      case "logic_less":
        {
          const { left, right } = this.getBinaryInputs(block);
          const typeA = this.inferType(left);
          const typeB = this.inferType(right);
        if (typeA !== "number" || typeB !== "number") {
          this.addIssue(block, "Las comparaciones < y > deben usar números ", "warning");
        }
        }
        break;

      case "logic_equals":
        {
          const { left, right } = this.getBinaryInputs(block);
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

    switch (block.type) {
      case "number":
      case "math_number":
      case "math_add":
      case "math_subtract":
      case "math_multiply":
      case "math_divide":
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
      case "logic_equals":
      case "logic_greater":
      case "wifi_is_connected":
      case "wifi_web_response_equals":
        return "boolean";

      case "string":
      case "wifi_local_ip":
      case "wifi_web_file_name":
      case "wifi_http_get_text":
      case "wifi_http_post_text":
        return "string";

      case "lists_create_empty":
      case "lists_create_with":
      case "lists_repeat":
      case "wifi_scan_networks":
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
        const value = this.inferValue(this.getConditionBlock(block));
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
