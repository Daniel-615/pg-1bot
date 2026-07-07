import type * as Blockly from "blockly";

export function getBackgroundCategories(): Blockly.utils.toolbox.ToolboxItemInfo[] {
  return [
    {
      kind: "category",
      name: "Fondos",
      colour: "#7c3aed",
      contents: [
        { kind: "block", type: "background_when_run" },
        { kind: "block", type: "background_move_steps" },
        { kind: "block", type: "background_turn_degrees" },
        { kind: "block", type: "background_go_to" },
        { kind: "block", type: "background_change_x" },
        { kind: "block", type: "background_change_y" },
        { kind: "block", type: "background_say" },
        { kind: "block", type: "background_set_scene" },
        { kind: "block", type: "background_wait_ms" },
      ],
    },
  ];
}
