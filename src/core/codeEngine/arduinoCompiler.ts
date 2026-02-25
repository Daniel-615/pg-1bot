import * as Blockly from "blockly";
import { arduinoGenerator } from "../../devices/arduinoUno/generator";
export function compileArduino(workspace: Blockly.Workspace) {

  arduinoGenerator.init(workspace);

  const topBlocks = workspace.getTopBlocks(true);

  let setupCode = "";
  let loopCode = "";

  topBlocks.forEach(block => {

    if (block.type === "arduino_setup") {
      setupCode += arduinoGenerator.blockToCode(block);
    }

    if (block.type === "arduino_loop") {
      loopCode += arduinoGenerator.blockToCode(block);
    }

  });

  const setupDefinitions = arduinoGenerator.setupDefinitions
    ? Array.from(arduinoGenerator.setupDefinitions).join("\n")
    : "";

  return `
void setup() {
${setupDefinitions}
${setupCode}
}

void loop() {
${loopCode}
}
`;
}