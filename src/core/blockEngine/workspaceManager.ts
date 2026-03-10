import * as Blockly from "blockly";
import "blockly/blocks";
import {ArduinoSemanticAnalyzer} from "./semantic/arduinoSemanticAnalyzer";
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
          colour: "#ffaa00",
          contents: [
            { kind: "block", type: "if" },
            { kind: "block", type: "if_else" },
            { kind: "block", type: "while_repeat" },
            { kind: "block", type: "do_while" },
            { kind: "block", type: "for_range" },
            { kind: "block", type: "break" },
            { kind: "block", type: "continue" },
            { kind: "block", type: "delay_ms" },
            { kind: "block", type: "repeat_until"},
          ],
        },
        {
          "kind": "category",
          "name": "VARIABLES",
          "colour": "#fb8e3b",
          "custom": "VARIABLE"
        },
        {
          kind: "category",
          name: "HARDWARE",
          colour: "#FF6680",
          contents: [
            { kind: "block", type: "led_set" },
          ],
        },
        {
          "kind": "category",
          "name": "OPERADORES",
          "colour":"#1a840a",
          "contents":[
            { "kind": "block", "type": "number" },
            { "kind": "block", "type": "string" },
            { "kind": "block", "type": "math_add" },
            { "kind": "block", "type": "math_subtract" },
            { "kind": "block", "type": "math_multiply" },
            { "kind": "block", "type": "math_divide" },
            { 
              "kind": "block", 
              "type": "logic_greater",
              "inputs": {
                "B":{
                  "shadow": {
                    "type": "math_number",
                    "fields":{
                      "NUM": 50
                    }
                  }
                }
              }
            },
            { 
              "kind": "block",
              "type": "logic_less",
              "inputs": {
                "B":{
                  "shadow": {
                    "type": "math_number",
                    "fields":{
                      "NUM": 50
                    }
                  }
                }
              }
            },
            { 
              "kind": "block", 
              "type": "logic_equal",
              "inputs": {
                "B":{
                  "shadow": {
                    "type": "math_number",
                    "fields":{
                      "NUM": 50
                    }
                  }
                }
              }
            },
            { "kind": "block", "type": "logic_and" },
            { "kind": "block", "type": "logic_or" },
            { "kind": "block", "type": "logic_not" },
            { "kind": "block", "type": "print" },
            
            { 
              "kind": "block", 
              "type": "math_random",
              "inputs": {
                "MIN": {
                  "shadow": {
                    "type": "number",
                    "fields":{
                      "NUM": 1
                    }
                  }
                },
                "MAX":{
                  "shadow": {
                    "type": "number",
                    "fields":{
                      "NUM": 10
                    }
                  }
                }
              }
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
    if(event.isUiEvent) return;
    if(
      event.type=== Blockly.Events.BLOCK_CREATE ||
      event.type=== Blockly.Events.BLOCK_DELETE ||
      event.type=== Blockly.Events.BLOCK_CHANGE ||
      event.type=== Blockly.Events.BLOCK_MOVE
    ){
      setTimeout(()=>{
        analyzer.analyze(workspace)
        //analyzer.startDebug(workspace);
        //analyzer.step(workspace)
      },0)
    }
  })
  return workspace;
}