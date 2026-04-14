import { blocklyText } from "../../../blockly/messages";

export function getCodeyAppearanceCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_CODEY_APPEARANCE"),
      colour: "#8B5CF6",
      contents: [
        { kind: "block", type: "codey_show_image", colour: "#8B5CF6", fields: { IMAGE: "0066660000000000" } },
        { kind: "block", type: "codey_show_image_at", colour: "#8B5CF6", fields: { IMAGE: "0066660000000000", X: 0, Y: 0 } },
        { kind: "block", type: "codey_clear_display", colour: "#8B5CF6" },
        { kind: "block", type: "codey_show_text", colour: "#8B5CF6", fields: { TEXT: "hello" } },
        { kind: "block", type: "codey_show_text_until_done", colour: "#8B5CF6", fields: { TEXT: "hello" } },
        { kind: "block", type: "codey_show_text_at", colour: "#8B5CF6", fields: { TEXT: "hello", X: 0, Y: 0 } },
        { kind: "block", type: "codey_set_pixel_on", colour: "#8B5CF6", fields: { X: 0, Y: 0 } },
        { kind: "block", type: "codey_set_pixel_off", colour: "#8B5CF6", fields: { X: 0, Y: 0 } },
        { kind: "block", type: "codey_toggle_pixel", colour: "#8B5CF6", fields: { X: 0, Y: 0 } },
        { kind: "block", type: "codey_get_pixel", colour: "#8B5CF6", fields: { X: 0, Y: 0 } },
      ],
    },
  ];
}
