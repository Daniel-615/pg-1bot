import * as Blockly from "blockly";
import type { VarType } from "../../base/symbolTable";

interface SerialArduinoHost {
  handleCheckUnusedExpression(block: Blockly.Block): void;
}

const ARDUINO_SERIAL_BLOCKS = new Set([
  "arduino_uno_serial_available",
  "arduino_uno_serial_read",
]);

export class SerialArduinoSemantic {
  private readonly host: SerialArduinoHost;

  constructor(host: SerialArduinoHost) {
    this.host = host;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!ARDUINO_SERIAL_BLOCKS.has(block.type)) {
      return false;
    }

    this.host.handleCheckUnusedExpression(block);
    return true;
  }

  inferType(block: Blockly.Block): VarType | undefined {
    if (ARDUINO_SERIAL_BLOCKS.has(block.type)) {
      return "number";
    }
    return undefined;
  }

  inferValue(block: Blockly.Block): { handled: boolean; value: unknown } {
    if (ARDUINO_SERIAL_BLOCKS.has(block.type)) {
      return { handled: true, value: 0 };
    }
    return { handled: false, value: null };
  }
}
