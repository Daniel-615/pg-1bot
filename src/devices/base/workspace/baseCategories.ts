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
      custom: "VARIABLE_EXTENDED"
    },
    ...getHardwareCategories(),
    ...getTypesCategories(),
    ...getControlCategories(),
    getOperatorsCategory()
  ];
}
