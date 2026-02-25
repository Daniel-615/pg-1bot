import * as Blockly from "blockly";

export const arduinoGenerator = new Blockly.Generator("Arduino") as Blockly.Generator & {
  setupDefinitions: Set<string>;
};

arduinoGenerator.init = function () {
  arduinoGenerator.setupDefinitions = new Set();
};

arduinoGenerator.scrub_ = function (block, code) {
  const nextBlock = block.nextConnection?.targetBlock();
  const nextCode = nextBlock
    ? arduinoGenerator.blockToCode(nextBlock)
    : "";
  return code + nextCode;
};

export function defineArduinoGenerator() {
    arduinoGenerator.forBlock["arduino_setup"] = function (block) {
        return arduinoGenerator.statementToCode(block, "SETUP_BODY");
    };
    arduinoGenerator.forBlock["arduino_loop"] = function (block) {
        return arduinoGenerator.statementToCode(block, "LOOP_BODY");
    };
    arduinoGenerator.forBlock["led_set"] = function (block) {
        const pin = block.getFieldValue("PIN");
        const state=block.getFieldValue("STATE");
        
        arduinoGenerator.setupDefinitions.add(
            `pinMode(${pin}, OUTPUT);`
        );

        return `digitalWrite(${pin}, ${state});\n`;
    };
    arduinoGenerator.forBlock["delay_ms"]= function(block){
        const time= block.getFieldValue("TIME");
        return `delay(${time});\n`;
    }
    arduinoGenerator.forBlock["if_else"] = function(block) {
      const condition = arduinoGenerator.valueToCode(block, "CONDITION", 99) || "false";
      const ifCode = arduinoGenerator.statementToCode(block, "IF_BODY");
      const elseCode = arduinoGenerator.statementToCode(block, "ELSE_BODY");

      let code = `if(${condition}) {\n${ifCode}}\n`;
      if (elseCode) {
        code += `else {\n${elseCode}}\n`;
      }
      return code;
    };
}