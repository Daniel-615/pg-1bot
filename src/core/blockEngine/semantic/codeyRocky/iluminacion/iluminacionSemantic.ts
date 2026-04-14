import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_LIGHTING_BLOCKS = new Set([
  "codey_led_rgb_for",
  "codey_led_rgb",
  "codey_led_component",
  "codey_led_off",
  "rocky_light_color",
  "rocky_light_off",
]);

export class IluminacionCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_LIGHTING_BLOCKS.has(block.type)) {
      return false;
    }

    let signature: string | null = null;

    switch (block.type) {
      case "codey_led_rgb_for": {
        const color = (block.getFieldValue("COLOR") || "#ff0000").toLowerCase();
        const seconds = Number(block.getFieldValue("SECONDS"));
        if (Number.isFinite(seconds) && seconds <= 0) {
          this.host.addIssue(block, "La duracion de la luz deberia ser mayor que 0", "warning");
        }
        if (color === "#000000") {
          this.host.addIssue(
            block,
            "Ese color equivale a apagar el LED. Conviene usar el bloque de apagar",
            "suggestion"
          );
        }
        signature = `${block.type}:${color}:${seconds}`;
        break;
      }

      case "codey_led_rgb": {
        const color = (block.getFieldValue("COLOR") || "#ff0000").toLowerCase();
        if (color === "#000000") {
          this.host.addIssue(
            block,
            "Ese color equivale a apagar el LED. Conviene usar el bloque de apagar",
            "suggestion"
          );
        }
        signature = `${block.type}:${color}`;
        break;
      }

      case "codey_led_component": {
        const value = Number(block.getFieldValue("VALUE"));
        if (Number.isFinite(value) && (value < 0 || value > 255)) {
          this.host.addIssue(block, "El valor del LED deberia estar entre 0 y 255", "warning");
        }
        if (Number.isFinite(value) && value === 0) {
          this.host.addIssue(
            block,
            "Ese valor de LED es 0. Si quieres apagarlo, conviene usar el bloque de apagar",
            "suggestion"
          );
        }
        signature = `${block.type}:${block.getFieldValue("COMPONENT") || "red"}:${value}`;
        break;
      }

      case "codey_led_off":
        signature = "codey_led_off";
        break;

      case "rocky_light_color":
      case "rocky_light_off":
        if (!this.state.hasCodeyRockyConnect) {
          this.host.addIssue(
            block,
            "Conviene conectar a Rocky antes de usar bloques de sensores o luces de Rocky",
            "warning"
          );
        }
        signature =
          block.type === "rocky_light_color"
            ? `${block.type}:${(block.getFieldValue("COLOR") || "red").toLowerCase()}`
            : "rocky_light_off";
        break;
    }

    if (signature && this.state.lastCodeyLightingSignature === signature) {
      this.host.addIssue(
        block,
        "Ese bloque repite el mismo estado de luz que el anterior y puede no producir un cambio visible",
        "suggestion"
      );
    }

    this.state.lastCodeyLightingSignature = signature;
    return true;
  }
}
