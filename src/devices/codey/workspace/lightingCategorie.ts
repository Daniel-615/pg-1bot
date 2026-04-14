import { blocklyText } from "../../../blockly/messages";

export function getCodeyLightingCategories() {
  return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_CODEY_LIGHTING"),
      colour: "#A86EDB",
      contents: [
        { kind: "block", type: "codey_led_rgb_for", colour: "#A86EDB", fields: { COLOR: "#ff0000", SECONDS: 1 } },
        { kind: "block", type: "codey_led_rgb", colour: "#A86EDB", fields: { COLOR: "#ff0000" } },
        { kind: "block", type: "codey_led_component", colour: "#A86EDB", fields: { COMPONENT: "red", VALUE: 255 } },
        { kind: "block", type: "codey_led_off", colour: "#A86EDB" },
        { kind: "block", type: "rocky_light_color", colour: "#A86EDB", fields: { COLOR: "red" } },
        { kind: "block", type: "rocky_light_off", colour: "#A86EDB" },
      ],
    },
  ];
}
