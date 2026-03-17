import { operatorsLogicCategories } from "./operatorsLogicCategories";
import { operatorsMathematicCategories } from "./operatorsMathematicCategories";
export const operatorsCategory = {
  kind: "category",
  name: "OPERADORES",
  colour: "#1a840a",
  contents: [
    ...operatorsMathematicCategories,
    ...operatorsLogicCategories,
  ],
};