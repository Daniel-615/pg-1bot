import { operatorsLogicCategories } from "./operatorsLogicCategories";
import { operatorsMathematicCategories } from "./operatorsMathematicCategories";
import { blocklyText } from "../../../../blockly/messages";
export function getOperatorsCategory() {
return {
  kind: "category",
  name: blocklyText("1BOT_CAT_OPERATORS"),
  colour: "#1a840a",
  contents: [
    ...operatorsMathematicCategories,
    ...operatorsLogicCategories,
  ],
};
}
