import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { applyBlocklyLocale } from "./blockly/messages";
import "./i18n";
import { registerArduinoUno } from "./devices/base/register";
import { ESP32Board } from "./devices/esp32/register";

applyBlocklyLocale();
registerArduinoUno();
new ESP32Board().registerBlocks();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
