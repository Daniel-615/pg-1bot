import * as Blockly from "blockly";
const ORDER_ATOMIC = 0;
import { ESP32Generator } from "../generator";

export function registerESP32WifiGenerator(generator: ESP32Generator) {
  generator.forBlock["wifi_connect"] = function (block: Blockly.Block) {
    const ssid = JSON.stringify(block.getFieldValue("SSID") || "ESP32_AP");
    const password = JSON.stringify(block.getFieldValue("PASSWORD") || "12345678");

    generator.addInclude("#include <WiFi.h>");
    generator.ensureSerial();
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
    generator.ensureSerial();
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
    return "WiFi.disconnect(true);\nWiFi.softAPdisconnect(true);\nWiFi.mode(WIFI_OFF);\n";
  };
  generator.forBlock["wifi_scan_networks"] = function () {
    generator.addInclude("#include <WiFi.h>");
    generator.addInclude("#include <vector>");
    return [
      `([]() {
        std::vector<String> _1botNetworks;
        int _1botNetworkCount = WiFi.scanNetworks();
        for (int _1botIndex = 0; _1botIndex < _1botNetworkCount; ++_1botIndex) {
          _1botNetworks.push_back(WiFi.SSID(_1botIndex));
        }
        WiFi.scanDelete();
        return _1botNetworks;
      })()`,
      ORDER_ATOMIC,
    ];
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
        _1botLastWebPath = _1botWebServer.uri();
        _1botWebServer.send(200, "text/plain", ${content});
      });
      _1botWebServer.onNotFound([]() {
        _1botLastWebPath = _1botWebServer.uri();
        _1botWebServer.send(404, "text/plain", "Not Found");
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

  generator.forBlock["wifi_http_get_text"] = function (block: Blockly.Block) {
    const url = generator.valueToCode(block, "URL", ORDER_ATOMIC) || "\"\"";

    generator.addInclude("#include <WiFi.h>");
    generator.addInclude("#include <HTTPClient.h>");
    return [
      `([]() {
        HTTPClient _1botHttp;
        String _1botResponse = "";
        _1botHttp.begin(${url});
        int _1botStatus = _1botHttp.GET();
        if (_1botStatus > 0) {
          _1botResponse = _1botHttp.getString();
        }
        _1botHttp.end();
        return _1botResponse;
      })()`,
      ORDER_ATOMIC,
    ];
  };

  generator.forBlock["wifi_http_post_text"] = function (block: Blockly.Block) {
    const url = generator.valueToCode(block, "URL", ORDER_ATOMIC) || "\"\"";
    const contentType = generator.valueToCode(block, "CONTENT_TYPE", ORDER_ATOMIC) || "\"application/json\"";
    const body = generator.valueToCode(block, "BODY", ORDER_ATOMIC) || "\"\"";

    generator.addInclude("#include <WiFi.h>");
    generator.addInclude("#include <HTTPClient.h>");
    return [
      `([]() {
        HTTPClient _1botHttp;
        String _1botResponse = "";
        _1botHttp.begin(${url});
        _1botHttp.addHeader("Content-Type", ${contentType});
        int _1botStatus = _1botHttp.POST(${body});
        if (_1botStatus > 0) {
          _1botResponse = _1botHttp.getString();
        }
        _1botHttp.end();
        return _1botResponse;
      })()`,
      ORDER_ATOMIC,
    ];
  };
}
