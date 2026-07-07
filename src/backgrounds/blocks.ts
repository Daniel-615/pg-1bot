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
          type: "field_number",
          name: "STEPS",
          value: 20,
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
          type: "field_number",
          name: "DEGREES",
          value: 15,
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
          type: "field_number",
          name: "X",
          value: 0,
        },
        {
          type: "field_number",
          name: "Y",
          value: 0,
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
          type: "field_number",
          name: "DX",
          value: 10,
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
          type: "field_number",
          name: "DY",
          value: 10,
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Mueve el robot verticalmente",
      helpUrl: "",
    },
    {
      type: "background_say",
      message0: "decir %1",
      args0: [
        {
          type: "field_input",
          name: "TEXT",
          text: "Hola, soy 1bot",
        },
      ],
      previousStatement: null,
      nextStatement: null,
      colour: BACKGROUND_COLOR,
      tooltip: "Muestra un mensaje sobre el robot",
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
          type: "field_number",
          name: "TIME",
          value: 300,
          min: 0,
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
