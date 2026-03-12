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
    return code;
  }

  private defineBlocks() {
    this.forBlock["program_start"] =(block)=>{
      const body= this.statementToCode(block, "DO");

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
    this.forBlock["print"]= (block)=>{
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


    this.forBlock["while_repeat"] = (block) => {
      const condition =
        this.valueToCode(block, "CONDITION", ORDER_NONE) || "false";

      const bodyCode =
        this.statementToCode(block, "BODY");

      return `while(${condition}) {\n${bodyCode}}\n`;
    };

    this.forBlock["repeat_until"]= function(block,generator){
      const condition= generator.valueToCode(block, "CONDITION", ORDER_NONE) || "false";
      const body= generator.statementToCode(block, "BODY");
      return `while (!(${condition})) {\n${body}}\n`;
    }
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
    this.forBlock["number"] = (block) => {
      const num = block.getFieldValue("NUM") || 0;
      return [`${num}`, ORDER_ATOMIC];
    };
    this.forBlock["logic_boolean"] = (block) =>{
      const bool= block.getFieldValue("BOOL");
      return [bool.toLowerCase(), ORDER_ATOMIC]
    }
    
    this.forBlock["for_range"] = (block) => {
      const variable = this.nameDB_!.getName(
        block.getFieldValue("VAR"),
        Blockly.VARIABLE_CATEGORY_NAME
      );

      const from =
        this.valueToCode(block, "FROM", ORDER_NONE) || "0";

      const to =
        this.valueToCode(block, "TO", ORDER_NONE) || "0";
      
      const step = block.getFieldValue("STEP") || "1";

      const body =
        this.statementToCode(block, "BODY");

      const comparator = Number(step) >= 0 ? "<=" : ">=";
      return `for (int ${variable} = ${from}; ${variable} ${comparator} ${to}; ${variable} += ${step}) {\n${body}}\n`;
    };
    this.forBlock["math_add"] =(block)=>{
      const A=this.valueToCode(block,"A", ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block,"B", ORDER_ATOMIC) || "0";
      return [`${A} + ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["math_subtract"]= (block) =>{
      const A= this.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} - ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["math_multiply"]= (block) =>{
      const A= this.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} * ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["math_divide"]= (block) =>{
      const A= this.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} / ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["logic_greater"]= (block) =>{
      const A= this.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} > ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["logic_less"]= (block) =>{
      const A= this.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= this.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} < ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["logic_equal"] = (block) => {
      const A = this.valueToCode(block, "A", ORDER_ATOMIC) || "0";
      const B = this.valueToCode(block, "B", ORDER_ATOMIC) || "0";
      return [`${A} == ${B}`, ORDER_ATOMIC];
    };
    this.forBlock["math_random"] = (block) => {
      const min = this.valueToCode(block, "MIN", ORDER_NONE) || "0";
      const max = this.valueToCode(block, "MAX", ORDER_NONE) || "10";

      return [`random(${min}, ${max})`, ORDER_ATOMIC];
    };
    this.forBlock["logic_and"]= (block)=>{
      const A= this.valueToCode(block, "A", ORDER_ATOMIC) || "true";
      const B= this.valueToCode(block, "B", ORDER_ATOMIC) || "false";
      return [`${A} && ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["logic_or"]= (block)=>{
      const A= this.valueToCode(block, "A", ORDER_ATOMIC) || "false";
      const B= this.valueToCode(block, "B", ORDER_ATOMIC) || "false";
      return [`${A} || ${B}`, ORDER_ATOMIC];
    }
    this.forBlock["logic_not"]= (block)=>{
      const value= this.valueToCode(block, "BOOL", ORDER_ATOMIC) || "false";
      return [`!${value}`, ORDER_ATOMIC];
    }
  }
}