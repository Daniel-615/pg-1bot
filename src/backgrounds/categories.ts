import type * as Blockly from "blockly";

function numberShadow(value: number) {
  return {
    shadow: {
      type: "number",
      fields: { NUM: value },
    },
  };
}

function stringShadow(value: string) {
  return {
    shadow: {
      type: "string",
      fields: { STRING: value },
    },
  };
}

function booleanShadow(value: boolean) {
  return {
    shadow: {
      type: "logic_boolean",
      fields: { BOOL: value ? "TRUE" : "FALSE" },
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

function comparisonBlock(type: string, left: number, right: number) {
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
      name: "Movimiento",
      colour: "#7c3aed",
      contents: [
        { kind: "block", type: "background_when_run" },
        { kind: "block", type: "background_move_steps", inputs: { STEPS: numberShadow(20) } },
        { kind: "block", type: "background_turn_degrees", inputs: { DEGREES: numberShadow(15) } },
        { kind: "block", type: "background_point_direction", inputs: { DEGREES: numberShadow(90) } },
        { kind: "block", type: "background_go_to", inputs: { X: numberShadow(0), Y: numberShadow(0) } },
        { kind: "block", type: "background_change_x", inputs: { DX: numberShadow(10) } },
        { kind: "block", type: "background_change_y", inputs: { DY: numberShadow(10) } },
        { kind: "block", type: "background_set_x", inputs: { X: numberShadow(0) } },
        { kind: "block", type: "background_set_y", inputs: { Y: numberShadow(0) } },
        { kind: "block", type: "background_reset_position" },
      ],
    },
    {
      kind: "category",
      name: "Apariencia",
      colour: "#a855f7",
      contents: [
        {
          kind: "block",
          type: "background_say",
          inputs: { TEXT: stringShadow("Hola, soy 1bot") },
        },
        { kind: "block", type: "background_hide_message" },
        { kind: "block", type: "background_set_actor" },
        { kind: "block", type: "background_set_scene" },
      ],
    },
    {
      kind: "category",
      name: "Control",
      colour: "#ffaa00",
      contents: [
        { kind: "block", type: "background_wait_ms", inputs: { TIME: numberShadow(300) } },
        { kind: "block", type: "if" },
        { kind: "block", type: "if_else" },
        {
          kind: "block",
          type: "for_range",
          inputs: {
            FROM: numberShadow(1),
            TO: numberShadow(5),
          },
        },
        { kind: "block", type: "while_repeat" },
        { kind: "block", type: "do_while" },
        { kind: "block", type: "repeat_until" },
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
      name: "Lógica",
      colour: "#1a840a",
      contents: [
        { kind: "block", type: "logic_boolean" },
        comparisonBlock("logic_greater", 10, 5),
        comparisonBlock("logic_less", 5, 10),
        comparisonBlock("logic_equal", 10, 10),
        {
          kind: "block",
          type: "logic_and",
          inputs: { A: booleanShadow(true), B: booleanShadow(false) },
        },
        {
          kind: "block",
          type: "logic_or",
          inputs: { A: booleanShadow(true), B: booleanShadow(false) },
        },
        {
          kind: "block",
          type: "logic_not",
          inputs: { BOOL: booleanShadow(false) },
        },
      ],
    },
    {
      kind: "category",
      name: "Texto",
      colour: "#c54040",
      contents: [
        { kind: "block", type: "string" },
        { kind: "block", type: "number" },
        { kind: "block", type: "logic_boolean" },
      ],
    },
    {
      kind: "category",
      name: "Matemáticas",
      colour: "#1a840a",
      contents: [
        { kind: "block", type: "number" },
        binaryMathBlock("math_add", 10, 5),
        binaryMathBlock("math_subtract", 10, 5),
        binaryMathBlock("math_multiply", 10, 5),
        binaryMathBlock("math_divide", 10, 2),
        {
          kind: "block",
          type: "math_random",
          inputs: { MIN: numberShadow(1), MAX: numberShadow(10) },
        },
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
