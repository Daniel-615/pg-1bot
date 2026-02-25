import * as Blockly from "blockly";
import "blockly/blocks";
import { registerArduinoUno } from "../../devices/arduinoUno/register";

export function createWorkspace(container: HTMLDivElement) {
  registerArduinoUno();
  const workspace = Blockly.inject(container, {
    toolbox: {
      kind: "flyoutToolbox",
      contents: [
        { kind: "block", type: "arduino_setup" },
        { kind: "block", type: "arduino_loop" },
        { kind: "block", type: "led_set"},
        { kind: "block", type: "delay_ms"},
        { kind: "block", type: "if_else"},
      ],
    },
  });

  setTimeout(() => {
    Blockly.svgResize(workspace);
  }, 100);

  return workspace;
}