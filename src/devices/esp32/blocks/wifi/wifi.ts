import * as Blockly from "blockly";
export function defineEsp32WifiBlocks(){
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "wifi_connect",
            "message0": "%{BKY_1BOT_ESP32_WIFI_CONNECT}",
            "args0":[
                {
                    "type": "field_input",
                    "name": "SSID",
                    
                },
                {
                    "type": "field_input",
                    "name": "PASSWORD"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#43927a",
            "tooltip": "Conecta el ESP32 a una red Wifi",
            "helpUrl": ""
        },
        {
            "type": "wifi_disconnect",
            "message0": "%{BKY_1BOT_ESP32_WIFI_DISCONNECT}",
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#43927a",
            "tooltip": "Desconecta el ESP32 de la red Wifi",
            "helpUrl": ""
        },
        {
            type: "wifi_scan_networks",
            "message0": "%{BKY_1BOT_ESP32_WIFI_SCAN}",
            "output": "Array",
            "colour": "#43927a",
            "tooltip": "Devuelve un array con los SSID de las redes WiFi cercanas",
            "helpUrl": ""
        },
        {
            "type": "wifi_create_ap",
            "message0": "%{BKY_1BOT_ESP32_WIFI_AP}",
            "args0":[
                {
                    "type": "field_input",
                    "name": "SSID"
                },
                {
                    "type": "field_input",
                    "name": "PASSWORD"
                },
                
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#43927a",
            "tooltip": "Crea un hotspot con el ESP32",
            "helpUrl": ""
        },
        {
            "type": "wifi_is_connected",
            "message0": "%{BKY_1BOT_ESP32_WIFI_IS_CONNECTED}",
            "output": "Boolean",
            "colour": "#43927a",
            "tooltip": "Devuelve verdadero si el ESP32 está conectado",
            "helpUrl": ""
        },
        {
            "type": "wifi_get_rssi",
            "message0": "%{BKY_1BOT_ESP32_WIFI_RSSI}",
            "output": "Number",
            "colour": "#43927a",
            "tooltip": "Devuelve el RSSI de la red actual",
            "helpUrl": ""
        },
        {
            "type": "wifi_local_ip",
            "message0": "%{BKY_1BOT_ESP32_WIFI_LOCAL_IP}",
            "output": "String",
            "colour": "#43927a",
            "tooltip": "Devuelve la IP local",
            "helpUrl": ""
        },
        {
            "type": "wifi_start_web_server",
            "message0": "%{BKY_1BOT_ESP32_WIFI_START_WEB}",
            "args0": [
                {
                    "type": "field_number",
                    "name": "PORT",
                    "value": 80,
                    "min": 1
                },
                {
                    "type": "field_input",
                    "name": "PATH",
                    "text": "/"
                },
                {
                    "type": "input_value",
                    "name": "CONTENT",
                    "check": "String"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#43927a",
            "tooltip": "Inicia un servidor web simple en el ESP32",
            "helpUrl": ""
        },
        {
            "type": "wifi_web_file_name",
            "message0": "%{BKY_1BOT_ESP32_WIFI_WEB_FILE}",
            "output": "String",
            "colour": "#43927a",
            "tooltip": "Devuelve la ultima ruta solicitada al servidor web",
            "helpUrl": ""
        },
        {
            "type": "wifi_web_response_equals",
            "message0": "%{BKY_1BOT_ESP32_WIFI_WEB_EQUALS}",
            "args0": [
                {
                    "type": "input_value",
                    "name": "VALUE",
                    "check": "String"
                }
            ],
            "output": "Boolean",
            "colour": "#43927a",
            "tooltip": "Compara la ultima ruta solicitada con un valor",
            "helpUrl": ""
        }
    ])
}
