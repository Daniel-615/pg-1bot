export const esp32WifiCategories = [
  {
    kind:"category",
    name:"WIFI",
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
      }
    ]
  }
]