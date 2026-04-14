import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const ROCKY_SENSOR_BLOCKS = new Set([
  "rocky_is_obstacle_ahead",
  "rocky_is_color",
  "rocky_detected_color",
  "rocky_light_strength",
  "rocky_reflected_light",
  "rocky_reflected_infrared",
  "rocky_greyness",
]);

const CODEY_SENSOR_BLOCKS = new Set([
  "codey_potentiometer_value",
  "codey_volume",
  "codey_light_intensity",
  "codey_battery_level",
  "codey_is_shaked",
  "codey_shake_strength",
  "codey_is_tilted",
  "codey_is_face",
  "codey_roll_angle",
  "codey_pitch_angle",
  "codey_rotation_angle",
  "codey_timer",
  "rocky_is_obstacle_ahead",
  "rocky_is_color",
  "rocky_detected_color",
  "rocky_light_strength",
  "rocky_reflected_light",
  "rocky_reflected_infrared",
  "rocky_greyness",
  "pulse_button",
]);

export class SensoresCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (
      !CODEY_SENSOR_BLOCKS.has(block.type) &&
      block.type !== "codey_reset_timer" &&
      block.type !== "codey_reset_rotation"
    ) {
      return false;
    }

    switch (block.type) {
      case "codey_reset_timer":
        if (this.state.codeyTimerResetSeen) {
          this.host.addIssue(block, "Ya reiniciaste el temporizador de Codey en este flujo", "suggestion");
        }
        this.state.codeyTimerResetSeen = true;
        return true;

      case "codey_reset_rotation": {
        const axis = block.getFieldValue("AXIS") || "all";
        if (
          this.state.codeyRotationResets.has(axis) ||
          (axis === "all" && this.state.codeyRotationResets.size > 0)
        ) {
          this.host.addIssue(
            block,
            "Ya reiniciaste ese angulo de rotacion de Codey en este flujo",
            "suggestion"
          );
        }
        this.state.codeyRotationResets.add(axis);
        return true;
      }

      default:
        this.host.handleCheckUnusedExpression(block);
        if (ROCKY_SENSOR_BLOCKS.has(block.type) && !this.state.hasCodeyRockyConnect) {
          this.host.addIssue(
            block,
            "Conviene conectar a Rocky antes de usar bloques de sensores o luces de Rocky",
            "warning"
          );
        }
        return true;
    }
  }
}
