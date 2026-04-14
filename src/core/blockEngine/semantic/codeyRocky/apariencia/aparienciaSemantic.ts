import * as Blockly from "blockly";
import type { CodeyRockyHost, CodeyRockyState } from "../shared";

const CODEY_APPEARANCE_BLOCKS = new Set([
  "codey_show_image",
  "codey_show_image_at",
  "codey_clear_display",
  "codey_show_text",
  "codey_show_text_until_done",
  "codey_show_text_at",
  "codey_set_pixel_on",
  "codey_set_pixel_off",
  "codey_toggle_pixel",
  "codey_get_pixel",
]);

export class AparienciaCodeyRockySemantic {
  private readonly host: CodeyRockyHost;
  private readonly state: CodeyRockyState;

  constructor(host: CodeyRockyHost, state: CodeyRockyState) {
    this.host = host;
    this.state = state;
  }

  handleBlock(block: Blockly.Block): boolean {
    if (!CODEY_APPEARANCE_BLOCKS.has(block.type)) {
      return false;
    }

    const validateOffset = () => {
      const x = Number(block.getFieldValue("X"));
      const y = Number(block.getFieldValue("Y"));
      if (
        (Number.isFinite(x) && (x < -15 || x > 15)) ||
        (Number.isFinite(y) && (y < -7 || y > 7))
      ) {
        this.host.addIssue(
          block,
          "La posicion x/y de imagen o texto deberia mantenerse dentro del rango visible",
          "warning"
        );
      }
    };

    const validatePixel = () => {
      const x = Number(block.getFieldValue("X"));
      const y = Number(block.getFieldValue("Y"));
      if (
        (Number.isFinite(x) && (x < 0 || x > 15)) ||
        (Number.isFinite(y) && (y < 0 || y > 7))
      ) {
        this.host.addIssue(
          block,
          "Las coordenadas del pixel deberian estar entre x 0-15 e y 0-7",
          "warning"
        );
      }
    };

    switch (block.type) {
      case "codey_show_text":
      case "codey_show_text_until_done":
      case "codey_show_text_at": {
        const text = block.getFieldValue("TEXT") || "";
        if (!text.trim()) {
          this.host.addIssue(block, "El texto de la pantalla no deberia estar vacio", "suggestion");
        }
        if (text.length > 16) {
          this.host.addIssue(
            block,
            "El texto puede ser demasiado largo para verse completo de un vistazo en la pantalla de Codey",
            "suggestion"
          );
        }
        if (block.type === "codey_show_text_at") {
          validateOffset();
        }
        break;
      }

      case "codey_show_image_at":
        validateOffset();
        break;

      case "codey_set_pixel_on":
      case "codey_set_pixel_off":
      case "codey_toggle_pixel":
      case "codey_get_pixel":
        validatePixel();
        break;
    }

    const signature = [
      block.type,
      block.getFieldValue("IMAGE") || "",
      block.getFieldValue("TEXT") || "",
      block.getFieldValue("X") || "",
      block.getFieldValue("Y") || "",
    ].join(":");

    if (this.state.lastCodeyDisplaySignature === signature) {
      this.host.addIssue(
        block,
        "Ese bloque repite la misma expresion o pantalla que el anterior y puede no producir un cambio visible",
        "suggestion"
      );
    }
    this.state.lastCodeyDisplaySignature = signature;

    if (block.type === "codey_get_pixel") {
      this.host.handleCheckUnusedExpression(block);
    }

    return true;
  }
}
