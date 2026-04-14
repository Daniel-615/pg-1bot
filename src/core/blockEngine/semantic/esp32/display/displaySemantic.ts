import * as Blockly from "blockly";

type Severity = "error" | "warning" | "suggestion";

interface DisplayHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
}

export class DisplaySemantic {
  private hasDisplayInit = false;
  private displayConfig: string | null = null;
  private readonly host: DisplayHost;

  constructor(host: DisplayHost) {
    this.host = host;
  }

  reset() {
    this.hasDisplayInit = false;
    this.displayConfig = null;
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "esp32_display_init": {
        const config = `${block.getFieldValue("SDA")}:${block.getFieldValue("SCL")}`;
        if (this.displayConfig && this.displayConfig !== config) {
          this.host.addIssue(
            block,
            "Ya inicializaste el display con otros pines. Usa una sola inicializacion por programa",
            "warning"
          );
        }
        this.displayConfig = this.displayConfig ?? config;
        this.hasDisplayInit = true;
        return true;
      }

      case "esp32_display_print":
      case "esp32_display_clear":
        if (!this.hasDisplayInit) {
          this.host.addIssue(
            block,
            "Debes inicializar el display antes de mostrar o limpiar contenido",
            "error"
          );
        }
        return true;

      default:
        return false;
    }
  }
}
