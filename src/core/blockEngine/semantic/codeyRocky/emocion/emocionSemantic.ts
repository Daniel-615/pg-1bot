import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_EMOTION_BLOCKS = new Set([
  "codey_emotion_look_up",
  "codey_emotion_look_down",
  "codey_emotion_look_left",
  "codey_emotion_look_right",
  "codey_emotion_look_around",
  "codey_emotion_blink",
  "codey_emotion_smile",
  "codey_emotion_oh_yes",
  "codey_emotion_naughty",
  "codey_emotion_proud",
  "codey_emotion_yummy",
  "codey_emotion_uh_oh",
  "codey_emotion_wow",
  "codey_emotion_hurt",
  "codey_emotion_sad",
  "codey_emotion_angry",
  "codey_emotion_hello",
  "codey_emotion_run",
  "codey_emotion_scared",
  "codey_emotion_shiver",
  "codey_emotion_dizzy",
  "codey_emotion_yawn",
  "codey_emotion_sleep",
  "codey_emotion_wakeup",
  "codey_emotion_yes",
  "codey_emotion_no",
]);

export class EmocionCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_EMOTION_BLOCKS.has(block.type)) {
      return false;
    }

    const signature = `emotion:${block.type}`;
    if (this.state.lastCodeyDisplaySignature === signature) {
      this.host.addIssue(
        block,
        "Ese bloque repite la misma expresion o pantalla que el anterior y puede no producir un cambio visible",
        "suggestion"
      );
    }
    this.state.lastCodeyDisplaySignature = signature;
    return true;
  }
}
