import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_INFRARED_BLOCKS = new Set([
  "codey_send_message_infrarred",
  "record_infrarred_message_controller",
  "send_signal_infrarred_controller_distance",
  "codey_receive_message_infrarred",
]);

export class InfrarrojoCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_INFRARED_BLOCKS.has(block.type)) {
      return false;
    }

    switch (block.type) {
      case "codey_send_message_infrarred": {
        const messageValue = this.host.inferValue(block.getInputTargetBlock("VALUE"));
        if (typeof messageValue !== "string" || !messageValue.trim()) {
          this.host.addIssue(block, "El mensaje infrarrojo no deberia estar vacio", "suggestion");
        }
        return true;
      }

      case "record_infrarred_message_controller":
        this.state.hasCodeyIrLearned = true;
        this.host.handleCheckUnusedExpression(block);
        return true;

      case "send_signal_infrarred_controller_distance":
        if (!this.state.hasCodeyIrLearned) {
          this.host.addIssue(
            block,
            "Debes grabar primero una senal infrarroja del control antes de enviarla",
            "error"
          );
        }
        return true;

      case "codey_receive_message_infrarred":
        this.host.handleCheckUnusedExpression(block);
        return true;

      default:
        return false;
    }
  }
}
