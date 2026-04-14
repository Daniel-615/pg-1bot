import { blocklyText } from "../../../blockly/messages";

export function getCodeyActionCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_CODEY_ACTION"),
      colour: "#4C8EF7",
      contents: [
        {
          kind: "block",
          type: "rocky_forward_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_backward_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_turn_left_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_turn_right_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_forward_straight_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_backward_straight_for",
          colour: "#4C8EF7",
          fields: { POWER: 50, SECONDS: 1 },
        },
        {
          kind: "block",
          type: "rocky_turn_left_degree",
          colour: "#4C8EF7",
          fields: { ANGLE: 15 },
        },
        {
          kind: "block",
          type: "rocky_turn_right_degree",
          colour: "#4C8EF7",
          fields: { ANGLE: 15 },
        },
        {
          kind: "block",
          type: "rocky_move_power",
          colour: "#4C8EF7",
          fields: { DIRECTION: "forward", POWER: 50 },
        },
        {
          kind: "block",
          type: "rocky_drive_power",
          colour: "#4C8EF7",
          fields: { LEFT_POWER: 50, RIGHT_POWER: 50 },
        },
        {
          kind: "block",
          type: "rocky_stop",
          colour: "#4C8EF7",
        },
      ],
    },
  ];
}
