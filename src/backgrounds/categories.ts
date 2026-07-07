import type * as Blockly from "blockly";

function numberShadow(value: number) {
  return {
    shadow: {
      type: "number",
      fields: { NUM: value },
    },
  };
}

function binaryMathBlock(type: string, left: number, right: number) {
  return {
    kind: "block",
    type,
    inputs: {
      A: numberShadow(left),
      B: numberShadow(right),
    },
  };
}

export function getBackgroundCategories(): Blockly.utils.toolbox.ToolboxItemInfo[] {
  return [
    {
      kind: "category",
      name: "Fondos",
      colour: "#7c3aed",
      contents: [
        { kind: "block", type: "background_when_run" },
        { kind: "block", type: "background_move_steps", inputs: { STEPS: numberShadow(20) } },
        { kind: "block", type: "background_turn_degrees", inputs: { DEGREES: numberShadow(15) } },
        { kind: "block", type: "background_go_to", inputs: { X: numberShadow(0), Y: numberShadow(0) } },
        { kind: "block", type: "background_change_x", inputs: { DX: numberShadow(10) } },
        { kind: "block", type: "background_change_y", inputs: { DY: numberShadow(10) } },
        {
          kind: "block",
          type: "background_say",
          inputs: {
            TEXT: {
              shadow: {
                type: "string",
                fields: { STRING: "Hola, soy 1bot" },
              },
            },
          },
        },
        { kind: "block", type: "background_set_actor" },
        { kind: "block", type: "background_set_scene" },
        { kind: "block", type: "background_wait_ms", inputs: { TIME: numberShadow(300) } },
      ],
    },
    {
      kind: "category",
      name: "Variables",
      colour: "#fb8e3b",
      custom: "VARIABLE",
    },
    {
      kind: "category",
      name: "Matemáticas",
      colour: "#1a840a",
      contents: [
        { kind: "block", type: "number" },
        { kind: "block", type: "string" },
        binaryMathBlock("math_add", 10, 5),
        binaryMathBlock("math_subtract", 10, 5),
        binaryMathBlock("math_multiply", 10, 5),
        binaryMathBlock("math_divide", 10, 2),
        { kind: "block", type: "math_sqrt", inputs: { VALUE: numberShadow(25) } },
        {
          kind: "block",
          type: "math_power",
          inputs: { BASE: numberShadow(2), EXPONENT: numberShadow(3) },
        },
      ],
    },
  ];
}
