import * as Blockly from "blockly";
import type { VarType } from "../../base/symbolTable";

type Severity = "error" | "warning" | "suggestion";

interface DatosArduinoHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  inferValue(block: Blockly.Block | null): unknown;
  handleCheckUnusedExpression(block: Blockly.Block): void;
}

const ARDUINO_DATA_BLOCKS = new Set([
  "arduino_uno_math_map",
  "arduino_uno_math_constrain",
  "arduino_uno_number_to_int",
  "arduino_uno_ascii_to_char",
  "arduino_uno_char_to_ascii",
  "arduino_uno_temporizador",
]);

export class DatosArduinoSemantic {
  private readonly host: DatosArduinoHost;

  constructor(host: DatosArduinoHost) {
    this.host = host;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!ARDUINO_DATA_BLOCKS.has(block.type)) {
      return false;
    }

    this.host.handleCheckUnusedExpression(block);

    switch (block.type) {
      case "arduino_uno_math_map": {
        const fromLow = this.host.inferValue(block.getInputTargetBlock("FROM_LOW"));
        const fromHigh = this.host.inferValue(block.getInputTargetBlock("FROM_HIGH"));
        if (typeof fromLow === "number" && typeof fromHigh === "number" && fromLow === fromHigh) {
          this.host.addIssue(block, "En mapear, el rango de origen no debe tener el mismo inicio y fin", "error");
        }
        break;
      }

      case "arduino_uno_ascii_to_char": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        if (typeof value === "number" && (value < 0 || value > 255)) {
          this.host.addIssue(block, "El codigo ASCII deberia estar entre 0 y 255", "warning");
        }
        break;
      }

      case "arduino_uno_char_to_ascii": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        if (typeof value === "string" && value.length === 0) {
          this.host.addIssue(block, "Conviene usar al menos un caracter para convertir a ASCII", "suggestion");
        }
        break;
      }

      case "arduino_uno_number_to_int": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        if (typeof value === "number" && Number.isInteger(value)) {
          this.host.addIssue(block, "Ese valor ya es entero; convertirlo de nuevo no cambia el resultado", "suggestion");
        }
        break;
      }
    }

    return true;
  }

  inferType(block: Blockly.Block): VarType | undefined {
    switch (block.type) {
      case "arduino_uno_math_map":
      case "arduino_uno_math_constrain":
      case "arduino_uno_number_to_int":
      case "arduino_uno_temporizador":
      case "arduino_uno_char_to_ascii":
        return "number";

      case "arduino_uno_ascii_to_char":
        return "string";

      default:
        return undefined;
    }
  }

  inferValue(block: Blockly.Block): { handled: boolean; value: unknown } {
    switch (block.type) {
      case "arduino_uno_math_map": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        const fromLow = this.host.inferValue(block.getInputTargetBlock("FROM_LOW"));
        const fromHigh = this.host.inferValue(block.getInputTargetBlock("FROM_HIGH"));
        const toLow = this.host.inferValue(block.getInputTargetBlock("TO_LOW"));
        const toHigh = this.host.inferValue(block.getInputTargetBlock("TO_HIGH"));
        const values = [value, fromLow, fromHigh, toLow, toHigh];
        if (values.some((item) => typeof item !== "number")) {
          return { handled: true, value: null };
        }

        const numericValue = value as number;
        const numericFromLow = fromLow as number;
        const numericFromHigh = fromHigh as number;
        const numericToLow = toLow as number;
        const numericToHigh = toHigh as number;

        if (numericFromHigh === numericFromLow) {
          return { handled: true, value: null };
        }

        return {
          handled: true,
          value:
            ((numericValue - numericFromLow) * (numericToHigh - numericToLow)) /
              (numericFromHigh - numericFromLow) +
            numericToLow,
        };
      }

      case "arduino_uno_math_constrain": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        const low = this.host.inferValue(block.getInputTargetBlock("LOW"));
        const high = this.host.inferValue(block.getInputTargetBlock("HIGH"));
        if (typeof value !== "number" || typeof low !== "number" || typeof high !== "number") {
          return { handled: true, value: null };
        }
        return { handled: true, value: Math.min(Math.max(value, low), high) };
      }

      case "arduino_uno_number_to_int": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        return { handled: true, value: typeof value === "number" ? Math.trunc(value) : null };
      }

      case "arduino_uno_ascii_to_char": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        return { handled: true, value: typeof value === "number" ? String.fromCharCode(value) : null };
      }

      case "arduino_uno_char_to_ascii": {
        const value = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        return {
          handled: true,
          value: typeof value === "string" && value.length > 0 ? value.charCodeAt(0) : null,
        };
      }

      case "arduino_uno_temporizador":
        return { handled: true, value: 0 };

      default:
        return { handled: false, value: null };
    }
  }
}
