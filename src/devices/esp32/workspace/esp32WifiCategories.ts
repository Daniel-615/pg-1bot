import { blocklyText } from "../../../blockly/messages";
export function getEsp32WifiCategories() {
return [
  {
    kind:"category",
    name:blocklyText("1BOT_CAT_WIFI"),
    colour:"#5C81A6",
    contents:[
      {
        kind:"block", 
        type:"wifi_connect"
      },
      {
        kind: "block",
        type: "wifi_disconnect"
      },
      {
        kind: "block",
        type: "wifi_create_ap"
      },
      {
        kind: "block",
        type: "wifi_is_connected"
      },
      {
        kind:"block", 
        type:"wifi_get_rssi"
      },
      {
        kind: "block",
        type: "wifi_local_ip"
      },
      {
        kind: "block",
        type: "wifi_scan_networks",
      },
      {
        kind: "block",
        type: "wifi_start_web_server",
      },
      {
        kind: "block",
        type: "wifi_web_file_name",
      },
      {
        kind: "block",
        type: "wifi_web_response_equals",
      },
      {
        kind: "block",
        type: "wifi_http_get_text",
      },
      {
        kind: "block",
        type: "wifi_http_post_text",
      }
    ]
  }
];
}
