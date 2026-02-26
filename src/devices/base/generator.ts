import * as Blockly from "blockly";

const ORDER_ATOMIC = 0;
const ORDER_NONE = 99;

export class ArduinoBaseGenerator extends Blockly.Generator {
  public setupDefinitions: Set<string>;

  constructor(name: string) {
    super(name);
    this.setupDefinitions = new Set();
    this.defineBlocks();
  }

  init(workspace: Blockly.Workspace) {
    this.setupDefinitions = new Set();

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
    const setupCode = Array.from(this.setupDefinitions).join("\n");

    return `void setup() {
${setupCode}
}

void loop() {
${code}
}
`;
  }

  private defineBlocks() {

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

    this.forBlock["math_arithmetic"] = (block) => {
      const OPERATORS: any = {
        ADD: "+",
        MINUS: "-",
        MULTIPLY: "*",
        DIVIDE: "/",
      };

      const operator = OPERATORS[block.getFieldValue("OP")];

      const left =
        this.valueToCode(block, "A", ORDER_ATOMIC) || "0";

      const right =
        this.valueToCode(block, "B", ORDER_ATOMIC) || "0";

      const code = `${left} ${operator} ${right}`;
      return [code, ORDER_ATOMIC];
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


    this.forBlock["if"] = (block) => {
      const condition =
        this.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

      const ifCode =
        this.statementToCode(block, "IF_BODY");

      return `if(${condition}) {\n${ifCode}}\n`;
    };

    this.forBlock["if_else"] = (block) => {
      const condition =
        this.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

      const ifCode =
        this.statementToCode(block, "IF_BODY");

      const elseCode =
        this.statementToCode(block, "ELSE_BODY");

      let code = `if(${condition}) {\n${ifCode}}\n`;

      if (elseCode) {
        code += `else {\n${elseCode}}\n`;
      }

      return code;
    };


    this.forBlock["while"] = (block) => {
      const condition =
        this.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

      const bodyCode =
        this.statementToCode(block, "BODY");

      return `while(${condition}) {\n${bodyCode}}\n`;
    };


    this.forBlock["do_while"] = (block) => {
      const condition =
        this.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

      const bodyCode =
        this.statementToCode(block, "BODY");

      return `do {\n${bodyCode}} while(${condition});\n`;
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

    this.forBlock["logic_boolean"] = (block) =>{
      const bool= block.getFieldValue("BOOL");
      return [bool.toLowerCase(), ORDER_ATOMIC]
    }
    this.forBlock["logic_compare"] = (block) =>{
      const OPERATORS: any={
        EQ: "==",
        NEQ: "!=",
        LT: "<",
        LTE: "<=",
        GT: ">",
        GTE: ">=",
      };
      const operator= OPERATORS[block.getFieldValue("OP")];
      const left= this.valueToCode(block, "A", ORDER_ATOMIC) || "0";
      const right= this.valueToCode(block, "B", ORDER_ATOMIC) || "0";
      const code= `${left} ${operator} ${right}`;
      return [code, ORDER_ATOMIC];
    }
    this.forBlock["for"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );

      const from =
        this.valueToCode(block, "FROM", ORDER_NONE) || "0";

      const to =
        this.valueToCode(block, "TO", ORDER_NONE) || "0";

      const body =
        this.statementToCode(block, "BODY");

      return `for (int ${variable} = ${from}; ${variable} <= ${to}; ${variable}++) {\n${body}}\n`;
    };
  }
}