import type * as Blockly from "blockly";
import type { ArduinoBaseGenerator } from "../devices/base/generator/generator";

function getField(block: Blockly.Block, name: string, fallback = "") {
  return String(block.getFieldValue(name) ?? fallback);
}

function getNumberCode(generator: ArduinoBaseGenerator, block: Blockly.Block, name: string, fallback = "0") {
  return generator.valueToCode(block, name, 99) || getField(block, name, fallback);
}

export function registerBackgroundGenerators(generator: ArduinoBaseGenerator) {
  generator.forBlock["background_when_run"] = (block: Blockly.Block) => {
    void block;
    return "// Fondo 1bot\n";
  };

  generator.forBlock["variables_set"] = (block: Blockly.Block) => {
    const variable = getField(block, "VAR", "variable");
    const value = generator.valueToCode(block, "VALUE", 99) || "0";
    return `// Fondo: ${variable} = ${value}\n`;
  };

  generator.forBlock["variables_set_dynamic"] = generator.forBlock["variables_set"];

  generator.forBlock["background_move_steps"] = (block: Blockly.Block) => {
    return `// Fondo: mover robot ${getNumberCode(generator, block, "STEPS")} pasos\n`;
  };

  generator.forBlock["background_turn_degrees"] = (block: Blockly.Block) => {
    return `// Fondo: girar robot ${getNumberCode(generator, block, "DEGREES")} grados\n`;
  };

  generator.forBlock["background_go_to"] = (block: Blockly.Block) => {
    return `// Fondo: ir a x ${getNumberCode(generator, block, "X")} y ${getNumberCode(generator, block, "Y")}\n`;
  };

  generator.forBlock["background_change_x"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar x por ${getNumberCode(generator, block, "DX")}\n`;
  };

  generator.forBlock["background_change_y"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar y por ${getNumberCode(generator, block, "DY")}\n`;
  };

  generator.forBlock["background_set_x"] = (block: Blockly.Block) => {
    return `// Fondo: fijar x en ${getNumberCode(generator, block, "X")}\n`;
  };

  generator.forBlock["background_set_y"] = (block: Blockly.Block) => {
    return `// Fondo: fijar y en ${getNumberCode(generator, block, "Y")}\n`;
  };

  generator.forBlock["background_point_direction"] = (block: Blockly.Block) => {
    return `// Fondo: apuntar robot a ${getNumberCode(generator, block, "DEGREES")} grados\n`;
  };

  generator.forBlock["background_reset_position"] = (block: Blockly.Block) => {
    void block;
    return "// Fondo: volver al centro\n";
  };

  generator.forBlock["background_say"] = (block: Blockly.Block) => {
    const text = generator.valueToCode(block, "TEXT", 99) || getField(block, "TEXT");
    return `// Fondo: decir ${text}\n`;
  };

  generator.forBlock["background_hide_message"] = (block: Blockly.Block) => {
    void block;
    return "// Fondo: ocultar mensaje\n";
  };

  generator.forBlock["background_set_actor"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar personaje a ${getField(block, "ACTOR")}\n`;
  };

  generator.forBlock["background_set_scene"] = (block: Blockly.Block) => {
    return `// Fondo: cambiar fondo a ${getField(block, "SCENE")}\n`;
  };

  generator.forBlock["background_wait_ms"] = (block: Blockly.Block) => {
    return `// Fondo: esperar ${getNumberCode(generator, block, "TIME")} ms\n`;
  };
}
