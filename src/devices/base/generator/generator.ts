import * as Blockly from "blockly";
import { registerControlGenerators } from "./control/control";
import { registerOperatorsLogicGenerator } from "./operators/operatorsLogic";
import { registerOperatorsMathematicsGenerator } from "./operators/operatorsMathematic";
import { registerJsonGenerators } from "./register/json";
import { registerListGenerators } from "./register/lists";
import { registerProgramGenerators } from "./register/program";
import { registerVariableGenerators } from "./register/variables";
import { cppStringLiteral } from "./utils/cppLiterals";
import { inferExpressionChecks, inferListCppType } from "./utils/typeInference";

const ORDER_NONE = 99;
type GeneratorRegistrar = (generator: ArduinoBaseGenerator) => void;

const baseRegistrars: GeneratorRegistrar[] = [
  registerProgramGenerators,
  registerVariableGenerators,
  registerListGenerators,
  registerJsonGenerators,
  registerControlGenerators,
  registerOperatorsLogicGenerator,
  registerOperatorsMathematicsGenerator,
];

export class ArduinoBaseGenerator extends Blockly.Generator {
  public setupDefinitions: Set<string>;
  public includes: Set<string>;
  public globalDefinitions: Set<string>;
  private keyedSetupDefinitions: Map<string, string>;
  private keyedGlobalDefinitions: Map<string, string>;
  protected serialBaudRate: number;
  protected serialStartupDelayMs: number | null;

  constructor(name: string) {
    super(name);
    this.resetGeneratorState();
    this.serialBaudRate = 9600;
    this.serialStartupDelayMs = null;
    this.registerBlocks();
  }

  init(workspace: Blockly.Workspace) {
    this.resetGeneratorState();
    if (!this.nameDB_) {
      this.nameDB_ = new Blockly.Names("");
    } else {
      this.nameDB_.reset();
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap());
  }

  scrub_(block: Blockly.Block, code: string) {
    const nextBlock = block.nextConnection?.targetBlock();
    const nextCode = nextBlock ? this.blockToCode(nextBlock) : "";
    return code + nextCode;
  }

  finish(code: string) {
    return code;
  }

  addInclude(code: string) {
    this.includes.add(code);
  }

  addGlobalDefinition(code: string, key?: string) {
    if (key) {
      this.keyedGlobalDefinitions.set(key, code);
      return;
    }

    this.globalDefinitions.add(code);
  }

  addSetupDefinition(code: string, key?: string) {
    if (key) {
      this.keyedSetupDefinitions.set(key, code);
      return;
    }

    this.setupDefinitions.add(code);
  }

  ensureSerial() {
    this.addSetupDefinition(`Serial.begin(${this.serialBaudRate});`);

    if (this.serialStartupDelayMs !== null) {
      this.addSetupDefinition(`delay(${this.serialStartupDelayMs});`);
    }
  }

  getAllGlobalDefinitions() {
    return [
      ...Array.from(this.globalDefinitions),
      ...Array.from(this.keyedGlobalDefinitions.values()),
    ];
  }

  getAllSetupDefinitions() {
    return [
      ...Array.from(this.setupDefinitions),
      ...Array.from(this.keyedSetupDefinitions.values()),
    ];
  }

  getJsonValueCode(parentBlock: Blockly.Block, inputName: string) {
    const inputBlock = parentBlock.getInputTargetBlock(inputName);
    if (!inputBlock) {
      return `String(${cppStringLiteral("\"\"")})`;
    }

    if (inputBlock.type === "string") {
      const text = inputBlock.getFieldValue("STRING") || "";
      return `String(${cppStringLiteral(JSON.stringify(text))})`;
    }

    if (inputBlock.type === "logic_boolean") {
      const boolValue = inputBlock.getFieldValue("BOOL") === "TRUE" ? "true" : "false";
      return `String(${cppStringLiteral(boolValue)})`;
    }

    const valueCode = this.valueToCode(parentBlock, inputName, ORDER_NONE) || "\"\"";
    const checks = inputBlock.outputConnection?.getCheck() ?? [];

    if (checks.includes("Boolean")) {
      return `((${valueCode}) ? String("true") : String("false"))`;
    }

    if (checks.includes("Number")) {
      return `String(${valueCode})`;
    }

    if (inputBlock.type === "json_object") {
      return valueCode;
    }

    return `String(${cppStringLiteral("\"")}) + String(${valueCode}) + String(${cppStringLiteral("\"")})`;
  }

  getCppVariableDeclaration(block: Blockly.Block, variableName: string) {
    const valueBlock = block.getInputTargetBlock("VALUE");

    if (!valueBlock) {
      return `float ${variableName} = 0;`;
    }

    switch (valueBlock.type) {
      case "string":
      case "json_object":
      case "wifi_local_ip":
      case "wifi_web_file_name":
      case "wifi_http_get_text":
      case "wifi_http_post_text":
        return `String ${variableName};`;

      case "logic_boolean":
      case "logic_and":
      case "logic_or":
      case "logic_not":
      case "logic_less":
      case "logic_equal":
      case "logic_greater":
      case "wifi_is_connected":
      case "wifi_web_response_equals":
        return `bool ${variableName} = false;`;

      case "lists_create_empty":
      case "lists_create_with":
        this.addInclude("#include <vector>");
        return `std::vector<${inferListCppType(valueBlock)}> ${variableName}{};`;

      default:
        if (valueBlock.type === "wifi_scan_networks") {
          this.addInclude("#include <vector>");
          return `std::vector<String> ${variableName}{};`;
        }

        if (inferExpressionChecks(valueBlock).includes("Boolean")) {
          return `bool ${variableName} = false;`;
        }

        if (inferExpressionChecks(valueBlock).includes("String")) {
          return `String ${variableName};`;
        }

        return `float ${variableName} = 0;`;
    }
  }

  private resetGeneratorState() {
    this.setupDefinitions = new Set();
    this.includes = new Set();
    this.globalDefinitions = new Set();
    this.keyedSetupDefinitions = new Map();
    this.keyedGlobalDefinitions = new Map();
  }

  private registerBlocks() {
    for (const register of baseRegistrars) {
      register(this);
    }
  }
}
