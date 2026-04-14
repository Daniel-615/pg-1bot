import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_SPEAKER_BLOCKS = new Set([
  "codey_play_sound",
  "codey_play_sound_until_done",
  "codey_stop_sounds",
  "codey_play_note",
  "codey_rest_beat",
  "codey_play_tone",
  "codey_change_volume",
  "codey_set_volume",
  "codey_current_volume",
]);

export class AltavozCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_SPEAKER_BLOCKS.has(block.type)) {
      return false;
    }

    let signature: string | null = null;

    switch (block.type) {
      case "codey_play_sound":
      case "codey_play_sound_until_done":
        signature = `${block.type}:${block.getFieldValue("SOUND") || "hello"}`;
        break;

      case "codey_stop_sounds":
        signature = "stop_sounds";
        break;

      case "codey_play_note":
      case "codey_rest_beat": {
        const beat = Number(block.getFieldValue("BEAT"));
        if (Number.isFinite(beat) && beat <= 0) {
          this.host.addIssue(block, "La duracion en tiempos deberia ser mayor que 0", "warning");
        }
        signature = `${block.type}:${block.getFieldValue("NOTE") || ""}:${block.getFieldValue("BEAT") || ""}`;
        break;
      }

      case "codey_play_tone": {
        const frequency = Number(block.getFieldValue("FREQUENCY"));
        const seconds = Number(block.getFieldValue("SECONDS"));
        if (Number.isFinite(frequency) && (frequency < 0 || frequency > 5000)) {
          this.host.addIssue(block, "La frecuencia deberia estar entre 0 y 5000 Hz", "warning");
        }
        if (Number.isFinite(seconds) && seconds <= 0) {
          this.host.addIssue(block, "La duracion del tono deberia ser mayor que 0", "warning");
        }
        signature = `${block.type}:${frequency}:${seconds}`;
        break;
      }

      case "codey_change_volume": {
        const delta = Number(block.getFieldValue("DELTA"));
        if (Number.isFinite(delta) && delta === 0) {
          this.host.addIssue(block, "Cambiar el volumen en 0 no produce ningun cambio", "suggestion");
        }
        signature = `${block.type}:${delta}`;
        break;
      }

      case "codey_set_volume": {
        const volume = Number(block.getFieldValue("VOLUME"));
        if (Number.isFinite(volume) && (volume < 0 || volume > 100)) {
          this.host.addIssue(block, "El volumen de Codey deberia estar entre 0 y 100", "warning");
        }
        signature = `${block.type}:${volume}`;
        break;
      }

      case "codey_current_volume":
        signature = "codey_current_volume";
        this.host.handleCheckUnusedExpression(block);
        break;
    }

    if (signature && this.state.lastCodeySpeakerSignature === signature) {
      this.host.addIssue(
        block,
        "Ese bloque repite el mismo sonido o ajuste de audio que el anterior y puede no producir un cambio apreciable",
        "suggestion"
      );
    }

    this.state.lastCodeySpeakerSignature = signature;
    return true;
  }
}
