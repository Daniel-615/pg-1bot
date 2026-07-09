import * as Blockly from "blockly";

const BACKGROUND_COLOR = "#7c3aed";

export function defineBackgroundBlocks() {
  Blockly.common.defineBlocksWithJsonArray([
    {
      type: "background_when_run",
      message0: "al ejecutar fondo",
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Inicio de las acciones del personaje en el fondo",
      helpUrl: "",
    },
    {
      type: "background_move_steps",
      message0: "mover robot %1 pasos",
      args0: [
        {
          type: "input_value",
          name: "STEPS",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Mueve el robot en la direccion actual",
      helpUrl: "",
    },
    {
      type: "background_turn_degrees",
      message0: "girar robot %1 grados",
      args0: [
        {
          type: "input_value",
          name: "DEGREES",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Gira el robot en el escenario",
      helpUrl: "",
    },
    {
      type: "background_go_to",
      message0: "ir a x %1 y %2",
      args0: [
        {
          type: "input_value",
          name: "X",
          check: "Number",
        },
        {
          type: "input_value",
          name: "Y",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Coloca el robot en una posicion del fondo",
      helpUrl: "",
    },
    {
      type: "background_change_x",
      message0: "cambiar x por %1",
      args0: [
        {
          type: "input_value",
          name: "DX",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Mueve el robot horizontalmente",
      helpUrl: "",
    },
    {
      type: "background_change_y",
      message0: "cambiar y por %1",
      args0: [
        {
          type: "input_value",
          name: "DY",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Mueve el robot verticalmente",
      helpUrl: "",
    },
    {
      type: "background_set_x",
      message0: "fijar x en %1",
      args0: [
        {
          type: "input_value",
          name: "X",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Fija la posicion horizontal del robot",
      helpUrl: "",
    },
    {
      type: "background_set_y",
      message0: "fijar y en %1",
      args0: [
        {
          type: "input_value",
          name: "Y",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Fija la posicion vertical del robot",
      helpUrl: "",
    },
    {
      type: "background_point_direction",
      message0: "apuntar robot a %1 grados",
      args0: [
        {
          type: "input_value",
          name: "DEGREES",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Cambia la direccion del robot",
      helpUrl: "",
    },
    {
      type: "background_reset_position",
      message0: "volver al centro",
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Regresa el robot al centro del fondo",
      helpUrl: "",
    },
    {
      type: "background_say",
      message0: "decir %1",
      args0: [
        {
          type: "input_value",
          name: "TEXT",
          check: ["String", "Number", "Boolean"],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Muestra un mensaje sobre el robot",
      helpUrl: "",
    },
    {
      type: "background_hide_message",
      message0: "ocultar mensaje",
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Oculta el mensaje del robot",
      helpUrl: "",
    },
    {
      type: "background_set_actor",
      message0: "cambiar personaje a %1",
      args0: [
        {
          type: "field_dropdown",
          name: "ACTOR",
          options: [
            ["robot 1bot", "robot"],
            ["personaje importado", "custom"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Cambia el personaje visible en el fondo",
      helpUrl: "",
    },
    {
      type: "background_set_scene",
      message0: "cambiar fondo a %1",
      args0: [
        {
          type: "field_dropdown",
          name: "SCENE",
          options: [
            ["aula", "classroom"],
            ["espacio", "space"],
            ["cuadricula", "grid"],
            ["imagen importada", "custom"],
          ],
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Cambia el fondo del escenario",
      helpUrl: "",
    },
    {
      type: "background_wait_ms",
      message0: "esperar %1 ms",
      args0: [
        {
          type: "input_value",
          name: "TIME",
          check: "Number",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Pausa la ejecucion visual del fondo",
      helpUrl: "",
    },
  ]);
}
