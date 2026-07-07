import type * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../devices/base/generator/generator";

function getField(block: Blockly.Block, name: string, fallback = "") {
  return String(block.getFieldValue(name) ?? fallback);
}

export function registerBackgroundGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["background_when_run"] = (block: Blockly.Block) => {
    void block;
    return "// Fondo 1bot\n";
  };

  generator.forBlock["background_move_steps"] = (block: Blockly.Block) => {
    return `// Fondo: mover robot ${getField(block, "STEPS", "0")} pasos\n`;
  };

  generator.forBlock["background_turn_degrees"] = (block: Blockly.Block) => {
    return `// Fondo: girar robot ${getField(block, "DEGREES", "0")} grados\n`;
  };

  generator.forBlock["background_go_to"] = (block: Blockly.Block) => {
    return `// Fondo: ir a x ${getField(block, "X", "0")} y ${getField(block, "Y", "0")}\n`;
  };

  generator.forBlock["background_change_x"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar x por ${getField(block, "DX", "0")}\n`;
  };

  generator.forBlock["background_change_y"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar y por ${getField(block, "DY", "0")}\n`;
  };

  generator.forBlock["background_say"] = (block: Blockly.Block) => {
    return `// Fondo: decir ${getField(block, "TEXT")}\n`;
  };

  generator.forBlock["background_set_scene"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar fondo a ${getField(block, "SCENE")}\n`;
  };

  generator.forBlock["background_wait_ms"] = (block: Blockly.Block) => {
    return `// Fondo: esperar ${getField(block, "TIME", "0")} ms\n`;
  };
}
