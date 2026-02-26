import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerArduinoUno } from "./devices/base/register";

registerArduinoUno();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);