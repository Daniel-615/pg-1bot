import * as Blockly from "blockly";
const ORDER_ATOMIC = 0;
import { ESP32Generator } from "../generator";

export function registerESP32WifiGenerator(generator: ESP32Generator) {
  generator.forBlock["wifi_connect"] = function (block: Blockly.Block) {
    const ssid = JSON.stringify(block.getFieldValue("SSID") || "ESP32_AP");
    const password = JSON.stringify(block.getFieldValue("PASSWORD") || "12345678");

    generator.addInclude("#include <WiFi.h>");
    generator.addSetupDefinition(`
      WiFi.mode(WIFI_STA);
      WiFi.begin(${ssid}, ${password});
      while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
      }
      Serial.println("");
      Serial.println("WiFi conectado");
      Serial.println(WiFi.localIP());
    `);

    return "";
  };

  generator.forBlock["wifi_create_ap"] = function (block: Blockly.Block) {
    const ssid = JSON.stringify(block.getFieldValue("SSID") || "ESP32_AP");
    const password = JSON.stringify(block.getFieldValue("PASSWORD") || "12345678");

    generator.addInclude("#include <WiFi.h>");
    generator.addSetupDefinition(`
      WiFi.mode(WIFI_AP);
      WiFi.softAP(${ssid}, ${password});
      Serial.println("Punto de acceso creado");
      Serial.println(WiFi.softAPIP());
    `);

    return "";
  };

  generator.forBlock["wifi_is_connected"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.status() == WL_CONNECTED", ORDER_ATOMIC];
  };
  generator.forBlock["wifi_disconnect"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return "WiFi.disconnect();\n";
  };
  generator.forBlock["wifi_scan_networks"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.scanNetworks()", ORDER_ATOMIC];
  };
  generator.forBlock["wifi_get_rssi"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.RSSI()", ORDER_ATOMIC];
  };

  generator.forBlock["wifi_local_ip"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.localIP().toString()", ORDER_ATOMIC];
  };

  generator.forBlock["wifi_start_web_server"] = function (block: Blockly.Block) {
    const port = block.getFieldValue("PORT") || "80";
    const path = JSON.stringify(block.getFieldValue("PATH") || "/");
    const content = generator.valueToCode(block, "CONTENT", ORDER_ATOMIC) || "\"\"";

    generator.addInclude("#include <WiFi.h>");
    generator.addInclude("#include <WebServer.h>");
    generator.addGlobalDefinition(`WebServer _1botWebServer(${port});`);
    generator.addGlobalDefinition(`String _1botLastWebPath = "None";`);
    generator.addSetupDefinition(`
      _1botWebServer.on(${path}, []() {
        _1botLastWebPath = ${path};
        _1botWebServer.send(200, "text/plain", ${content});
      });
      _1botWebServer.begin();
    `);

    return "_1botWebServer.handleClient();\n";
  };

  generator.forBlock["wifi_web_file_name"] = function () {
    generator.addInclude("#include <WebServer.h>");
    generator.addGlobalDefinition(`String _1botLastWebPath = "None";`);
    return ["_1botLastWebPath", ORDER_ATOMIC];
  };

  generator.forBlock["wifi_web_response_equals"] = function (block: Blockly.Block) {
    const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "\"None\"";

    generator.addInclude("#include <WebServer.h>");
    generator.addGlobalDefinition(`String _1botLastWebPath = "None";`);
    return [`_1botLastWebPath == ${value}`, ORDER_ATOMIC];
  };
}
