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
    generator.addInclude("#include  <Wifi.h>");
    return "WiFi.disconnect()";
  };
  generator.forBlock["wifi_scan_networks"] = function(){
    generator.addInclude("#include <Wifi.h>")
    return ["Wifi.scanNetworks()", ORDER_ATOMIC];
  }
  generator.forBlock["wifi_get_rssi"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.RSSI()", ORDER_ATOMIC];
  };

  generator.forBlock["wifi_local_ip"] = function () {
    generator.addInclude("#include <WiFi.h>");
    return ["WiFi.localIP().toString()", ORDER_ATOMIC];
  };
}