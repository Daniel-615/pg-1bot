import * as Blockly from "blockly";
import { registerControlGenerators } from "./control/control";
import { registerOperatorsLogicGenerator } from "./operators/operatorsLogic";
import { registerOperatorsMathematicsGenerator } from "./operators/operatorsMathematic";
const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

export class ArduinoBaseGenerator extends Blockly.Generator {
  public setupDefinitions: Set<string>;
  public includes: Set<String>;
  public globalDefinitions: Set<String>;

  constructor(name: string) {
    super(name);
    this.setupDefinitions = new Set();
    this.includes = new Set();
    this.globalDefinitions = new Set();
    this.defineBlocks();
  }

  init(workspace: Blockly.Workspace) {
    this.setupDefinitions = new Set();
    this.includes = new Set();
    this.globalDefinitions = new Set();
    if (!this.nameDB_) {
      this.nameDB_ = new Blockly.Names("");
    } else {
      this.nameDB_.reset();
    }
    this.nameDB_.setVariableMap(workspace.getVariableMap());
  }
  scrub_(block: Blockly.Block, code: string) {
    const nextBlock = block.nextConnection?.targetBlock();
    const nextCode = nextBlock
      ? this.blockToCode(nextBlock)
      : "";
    return code + nextCode;
  }

  finish(code: string) {
    return code;
  };
  addInclude(code: String) {
    this.includes.add(code)
  };
  addGlobalDefinition(code: string) {
    this.globalDefinitions.add(code);
  };
  addSetupDefinition(code: string) {
    this.setupDefinitions.add(code);
  };

  private defineBlocks() {
    registerControlGenerators(this);
    registerOperatorsLogicGenerator(this);
    registerOperatorsMathematicsGenerator(this);
    this.forBlock["program_start"] = (block) => {
      const body = this.statementToCode(block, "DO");

      return `
        void setup() {
          Serial.begin(9600);
          ${Array.from(this.setupDefinitions).join("\n  ")}
        }
        void loop() {
        ${body}
        }
      `;
    };
    this.forBlock["string"] = (block) => {
      const text = block.getFieldValue("STRING") || "";
      return [`"${text}"`, ORDER_ATOMIC];
    };
    this.forBlock["print"] = (block) => {
      const value = this.valueToCode(block, "TEXT", ORDER_NONE) || '""';
      return `Serial.println(${value});\n`;
    }
    this.forBlock["variables_get"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );
      return [variable, ORDER_ATOMIC];
    };
    this.forBlock["variables_set"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );
      const value =
        this.valueToCode(block, "VALUE", ORDER_NONE) || "0";
      return `${variable} = ${value};\n`;
    };
    this.forBlock["led_set"] = (block) => {
      const pin = block.getFieldValue("PIN");
      const state = block.getFieldValue("STATE");
      this.setupDefinitions.add(
        `pinMode(${pin}, OUTPUT);`
      );
      return `digitalWrite(${pin}, ${state});\n`;
    };
    this.forBlock["delay_ms"] = (block) => {
      const time = block.getFieldValue("TIME");
      return `delay(${time});\n`;
    };
    this.forBlock["break"] = () => {
      return `break;\n`;
    };
    this.forBlock["continue"] = () => {
      return `continue;\n`;
    };
    this.forBlock["math_number"] = (block) => {
      const num = block.getFieldValue("NUM");
      return [num, ORDER_ATOMIC];
    };
    this.forBlock["number"] = (block) => {
      const num = block.getFieldValue("NUM") || 0;
      return [`${num}`, ORDER_ATOMIC];
    };
    this.forBlock["lists_create_empty"] = () => {
      this.addInclude("#include <vector>");
      return ["std::vector<int>{}", ORDER_ATOMIC];
    };
    this.forBlock["lists_create_with"] = (block) => {
      this.addInclude("#include <vector>");
      const items: string[] = [];
      const listBlock = block as Blockly.Block & { itemCount_?: number };
      const itemCount = listBlock.itemCount_ ?? 0;

      for (let i = 0; i < itemCount; i++) {
        const itemCode = this.valueToCode(block, `ADD${i}`, ORDER_NONE) || "0";

        items.push(itemCode);
      }

      return [`std::vector<int>{${items.join(", ")}}`, ORDER_ATOMIC];
    };

    this.forBlock["lists_length"] = (block) => {
      const value = this.valueToCode(block, "VALUE", ORDER_ATOMIC) || "std::vector<int>{}";
      return [`${value}.size()`, ORDER_ATOMIC];
    };
    this.forBlock["list_var_get_index"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );

      const where = block.getFieldValue("WHERE") || "FROM_START";

      let indexCode = "0";
      if (where === "FIRST") {
        indexCode = "0";
      } else if (where === "LAST") {
        indexCode = `${variable}.size() - 1`;
      } else {
        indexCode = this.valueToCode(block, "AT", ORDER_NONE) || "0";
      }

      return [`${variable}[${indexCode}]`, ORDER_ATOMIC];
    };

    this.forBlock["list_var_set_index"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );

      const where = block.getFieldValue("WHERE") || "FROM_START";
      const valueCode = this.valueToCode(block, "TO", ORDER_NONE) || "0";

      let indexCode = "0";
      if (where === "FIRST") {
        indexCode = "0";
      } else if (where === "LAST") {
        indexCode = `${variable}.size() - 1`;
      } else {
        indexCode = this.valueToCode(block, "AT", ORDER_NONE) || "0";
      }

      return `${variable}[${indexCode}] = ${valueCode};\n`;
    };

  }
}
