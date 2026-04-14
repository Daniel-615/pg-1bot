import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_ROCKY_ACTION_BLOCKS = new Set([
  "rocky_forward_for",
  "rocky_backward_for",
  "rocky_turn_left_for",
  "rocky_turn_right_for",
  "rocky_forward_straight_for",
  "rocky_backward_straight_for",
  "rocky_move_power",
  "rocky_drive_power",
  "rocky_turn_left_degree",
  "rocky_turn_right_degree",
  "rocky_stop",
]);

export class MovimientoCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_ROCKY_ACTION_BLOCKS.has(block.type)) {
      return false;
    }

    if (!this.state.hasCodeyRockyConnect) {
      this.host.addIssue(block, "Conviene conectar a Rocky antes de usar bloques de movimiento", "warning");
    }

    if (block.type === "rocky_stop") {
      if (this.state.rockyStopped) {
        this.host.addIssue(block, "Rocky ya estaba detenido por el bloque anterior", "suggestion");
      }
      this.state.rockyStopped = true;
      return true;
    }

    this.state.rockyStopped = false;

    switch (block.type) {
      case "rocky_forward_for":
      case "rocky_backward_for":
      case "rocky_turn_left_for":
      case "rocky_turn_right_for":
      case "rocky_forward_straight_for":
      case "rocky_backward_straight_for": {
        this.validateRockyPower(block, "POWER");
        const seconds = Number(block.getFieldValue("SECONDS"));
        if (Number.isFinite(seconds) && seconds <= 0) {
          this.host.addIssue(block, "El tiempo de movimiento de Rocky deberia ser mayor que 0", "warning");
        }
        break;
      }

      case "rocky_move_power":
        this.validateRockyPower(block, "POWER");
        break;

      case "rocky_drive_power":
        this.validateRockyPower(block, "LEFT_POWER");
        this.validateRockyPower(block, "RIGHT_POWER");
        break;

      case "rocky_turn_left_degree":
      case "rocky_turn_right_degree": {
        const angle = Number(block.getFieldValue("ANGLE"));
        if (Number.isFinite(angle) && angle <= 0) {
          this.host.addIssue(block, "Los grados de giro de Rocky deberian ser mayores que 0", "warning");
        }
        break;
      }
    }

    return true;
  }

  private validateRockyPower(block: Blockly.Block, fieldName: string) {
    const value = Number(block.getFieldValue(fieldName));
    if (!Number.isFinite(value)) return;

    if (value < -100 || value > 100) {
      this.host.addIssue(block, "La potencia de Rocky deberia estar entre -100 y 100", "warning");
    }

    if (value === 0) {
      this.host.addIssue(block, "La potencia de Rocky deberia ser distinta de 0", "suggestion");
    }
  }
}
