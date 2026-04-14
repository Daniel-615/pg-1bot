import * as Blockly from "blockly";

type Severity = "error" | "warning" | "suggestion";

interface WifiHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  inferValue(block: Blockly.Block | null): unknown;
}

export class WifiSemantic {
  private hasWifiSetup = false;
  private hasWebServerInit = false;
  private wifiMode: "none" | "station" | "ap" = "none";
  private wifiConnected = false;
  private webServerPort: string | null = null;
  private readonly host: WifiHost;

  constructor(host: WifiHost) {
    this.host = host;
  }

  reset() {
    this.hasWifiSetup = false;
    this.hasWebServerInit = false;
    this.wifiMode = "none";
    this.wifiConnected = false;
    this.webServerPort = null;
  }

  handleBlock(block: Blockly.Block): boolean {
    switch (block.type) {
      case "wifi_connect":
        if (!block.getFieldValue("SSID")?.trim()) {
          this.host.addIssue(block, "El SSID no debería estar vacío", "suggestion");
        }
        if (!block.getFieldValue("PASSWORD")?.trim()) {
          this.host.addIssue(block, "La contraseña WiFi no debería estar vacía", "suggestion");
        } else if ((block.getFieldValue("PASSWORD") ?? "").trim().length < 8) {
          this.host.addIssue(block, "La contraseña WiFi debería tener al menos 8 caracteres", "warning");
        }
        if (this.wifiMode === "ap") {
          this.host.addIssue(
            block,
            "Ya configuraste un punto de acceso. Evita mezclar modo AP y conexion WiFi cliente en el mismo flujo",
            "warning"
          );
        }
        if (this.wifiConnected && this.wifiMode === "station") {
          this.host.addIssue(block, "Ya existe una conexion WiFi cliente previa en este flujo", "suggestion");
        }
        this.hasWifiSetup = true;
        this.wifiMode = "station";
        this.wifiConnected = true;
        return true;

      case "wifi_create_ap":
        if (!block.getFieldValue("SSID")?.trim()) {
          this.host.addIssue(block, "El SSID del punto de acceso no debería estar vacío", "suggestion");
        }
        if (!block.getFieldValue("PASSWORD")?.trim()) {
          this.host.addIssue(block, "La contraseña del punto de acceso no debería estar vacía", "suggestion");
        } else if ((block.getFieldValue("PASSWORD") ?? "").trim().length < 8) {
          this.host.addIssue(
            block,
            "La contraseña del punto de acceso debería tener al menos 8 caracteres",
            "warning"
          );
        }
        if (this.wifiMode === "station") {
          this.host.addIssue(
            block,
            "Ya configuraste una conexion WiFi cliente. Evita mezclar modo cliente y punto de acceso en el mismo flujo",
            "warning"
          );
        }
        if (this.wifiConnected && this.wifiMode === "ap") {
          this.host.addIssue(block, "Ya existe un punto de acceso configurado en este flujo", "suggestion");
        }
        this.hasWifiSetup = true;
        this.wifiMode = "ap";
        this.wifiConnected = true;
        return true;

      case "wifi_disconnect":
        if (!this.wifiConnected) {
          this.host.addIssue(
            block,
            "No puedes desconectar WiFi si antes no conectaste o creaste un punto de acceso",
            "error"
          );
        }
        this.wifiConnected = false;
        this.hasWebServerInit = false;
        return true;

      case "wifi_start_web_server":
        if (this.webServerPort && this.webServerPort !== (block.getFieldValue("PORT") || "80")) {
          this.host.addIssue(
            block,
            "Ya iniciaste un servidor web en otro puerto. Usa un solo puerto por programa",
            "warning"
          );
        }
        if (!this.hasWifiSetup) {
          this.host.addIssue(
            block,
            "Conviene conectar WiFi o crear un punto de acceso antes de iniciar el servidor web",
            "warning"
          );
        }
        if (!this.wifiConnected) {
          this.host.addIssue(
            block,
            "No hay una conexion WiFi activa para iniciar el servidor web",
            "error"
          );
        }
        this.hasWebServerInit = true;
        this.webServerPort = this.webServerPort ?? (block.getFieldValue("PORT") || "80");
        return true;

      case "wifi_get_rssi":
        if (this.wifiMode !== "station" || !this.wifiConnected) {
          this.host.addIssue(
            block,
            "La intensidad de señal solo esta disponible cuando hay una conexion WiFi cliente activa",
            "error"
          );
        }
        if (!this.hasWifiSetup) {
          this.host.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de consultar este dato",
            "error"
          );
        }
        return true;

      case "wifi_local_ip":
        if (!this.hasWifiSetup) {
          this.host.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de consultar este dato",
            "error"
          );
        }
        if (!this.wifiConnected) {
          this.host.addIssue(
            block,
            "No hay una conexion WiFi activa para consultar este dato",
            "error"
          );
        }
        return true;

      case "wifi_web_file_name":
      case "wifi_web_response_equals":
        if (!this.hasWebServerInit) {
          this.host.addIssue(
            block,
            "Debes iniciar el servidor web antes de consultar la ruta solicitada",
            "error"
          );
        }
        return true;

      case "wifi_http_get_text":
      case "wifi_http_post_text":
        if (!this.hasWifiSetup || !this.wifiConnected) {
          this.host.addIssue(
            block,
            "Debes conectar WiFi o crear un punto de acceso antes de hacer peticiones HTTP",
            "error"
          );
        }
        if (block.type === "wifi_http_post_text") {
          const contentTypeBlock = block.getInputTargetBlock("CONTENT_TYPE");
          const contentTypeValue = this.host.inferValue(contentTypeBlock);

          if (typeof contentTypeValue !== "string" || !contentTypeValue.trim()) {
            this.host.addIssue(
              block,
              "En content-type normalmente va algo como application/json o text/plain",
              "suggestion"
            );
          } else {
            const normalizedContentType = contentTypeValue.trim().toLowerCase();
            if (normalizedContentType === "post" || normalizedContentType === "get") {
              this.host.addIssue(
                block,
                "En content-type no va el metodo HTTP. Usa valores como application/json o text/plain",
                "warning"
              );
            }
          }
        }
        return true;

      default:
        return false;
    }
  }
}
