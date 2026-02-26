import * as Blockly from "blockly";
import "blockly/blocks";
import {ArduinoSemanticAnalyzer} from "./arduinoSemanticAnalyzer";
export function createWorkspace(container: HTMLDivElement) {
  //importar el analizador de errores
  const analyzer= new ArduinoSemanticAnalyzer();
  const workspace = Blockly.inject(container, {
    toolbox: {
      kind: "categoryToolbox",
      contents: [
        {
          kind: "category",
          name: "CONTROL",
          colour: "#FFAB19",
          contents: [
            { kind: "block", type: "if" },
            { kind: "block", type: "if_else" },
            { kind: "block", type: "while" },
            { kind: "block", type: "do_while" },
            { kind: "block", type: "for" },
            { kind: "block", type: "break" },
            { kind: "block", type: "continue" },
          ],
        },
        {
          "kind": "category",
          "name": "VARIABLES",
          "colour": "#A65CFF",
          "custom": "VARIABLE"
        },
        {
          kind: "category",
          name: "HARDWARE",
          colour: "#FF6680",
          contents: [
            { kind: "block", type: "led_set" },
            { kind: "block", type: "delay_ms" },
          ],
        },
        {
          "kind": "category",
          "name": "MATH",
          "colour":"#5C81A6",
          "contents":[
            {
              "kind": "block",
              "type": "math_number"
            },
            {
              "kind": "block",
              "type": "math_arithmetic"
            },
            {
              "kind": "block",
              "type": "logic_boolean"
            },
            {
              "kind": "block",
              "type": "logic_compare"
            },
            {
              "kind": "block",
              "type": "logic_operation"
            },
            {
              "kind": "block",
              "type": "logic_negate"
            }
          ]
        }
      ],
    },
  });
  workspace.addChangeListener((event)=>{
    /* 
      Se ejecuta el análisis semántico cada vez que se crea, borra,
      cambia o mueve un bloque, para detectar errores en tiempo real.
    */
    if(
      event.type=== Blockly.Events.BLOCK_CREATE ||
      event.type=== Blockly.Events.BLOCK_DELETE ||
      event.type=== Blockly.Events.BLOCK_CHANGE ||
      event.type=== Blockly.Events.BLOCK_MOVE
    ){
      analyzer.analyze(workspace)
    }
  })
  setTimeout(() => {
    Blockly.svgResize(workspace);
  }, 100);

  return workspace;
}