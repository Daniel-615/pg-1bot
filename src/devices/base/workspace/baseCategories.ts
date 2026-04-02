import { blocklyText } from "../../../blockly/messages";
import { getHardwareCategories } from "./hardware/hardwareCategories";
import { getOperatorsCategory } from "./operators/operatorsCategory";
import { getTypesCategories } from "./types/typesCategories";
import { getControlCategories } from "./control/controlCategories";
export function getBaseCategories() {
return [
    {
      kind: "category",
      name: blocklyText("1BOT_CAT_VARIABLES"),
      colour: "#fb8e3b",
      contents:[
        {
          kind:"custom",
          custom: "VARIABLE"
        },
        {
          kind: "sep"
        },
        {
          kind: "block",
          type: "lists_create_with"
        },
        {
          kind: "block",
          type: "lists_length"
        },
        {
          kind: "block",
          type: "list_var_get_index"
        },
        {
          kind: "block",
          type: "list_var_set_index"
        }
      ]
    },
    ...getHardwareCategories(),
    ...getTypesCategories(),
    ...getControlCategories(),
    getOperatorsCategory()
  ];
}
