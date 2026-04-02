import { blocklyText } from "../../../../blockly/messages";
export function getTypesCategories() {
return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_TYPES"),
      colour: "#c54040",
      contents: [
        {
          kind: "block",
          type: "number",
        },
        {
          kind: "block",
          type: "logic_boolean",
        },
        {
          kind: "block",
          type: "string",
        },
      ],
    },
];
}
