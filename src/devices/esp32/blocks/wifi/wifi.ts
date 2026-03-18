import * as Blockly from "blockly";
export function defineEsp32WifiBlocks(){
    Blockly.defineBlocksWithJsonArray([
        {
            "type": "wifi_connect",
            "message0": "conectar Wifi SSID %1 contraseña %2",
            "args0":[
                {
                    "type": "field_input",
                    "name": "SSID",
                    
                },
                {
                    "type": "field_input",
                    "name": "password"
                }
            ],
            "previousStatement": null,
            "nextStatement": null,
            "colour": "#43927a",
            "tooltip": "Conecta el ESP32 a una red Wifi",
            "helpUrl": ""
        },
        {
            "type": "wifi_create_ap",
            "message0": "crear punto de acceso SSID %1 contraseña %2",
            "args0":[
                {
                    "type": "field_input",
                    "name": "SSID"
                },
                {
                    "type": "field_input",
                    "name": "password"
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
            "message0": "¿Wifi conectado?",
            "output": "Boolean",
            "colour": "#43927a",
            "tooltip": "Devuelve verdadero si el ESP32 está conectado",
            "helpUrl": ""
        },
        {
            "type": "wifi_get_rssi",
            "message0": "fuerza de señal wifi",
            "output": "Number",
            "colour": "#43927a",
            "tooltip": "Devuelve el RSSI de la red actual",
            "helpUrl": ""
        },
        {
            "type": "wifi_local_ip",
            "message0": "IP local wifi",
            "output": "String",
            "colour": "#43927a",
            "tooltip": "Devuelve la IP local",
            "helpUrl": ""
        }
    ])
}