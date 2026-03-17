import { hardwareCategories } from "./hardware/hardwareCategories";
import { operatorsCategory } from "./operators/operatorsCategory";
import { typesCategories } from "./types/typesCategories";
import { controlCategories } from "./control/controlCategories";
export const baseCategories = [
    {
      kind: "category",
      name: "VARIABLES",
      colour: "#fb8e3b",
      custom: "VARIABLE",
    },
    ...hardwareCategories,
    ...typesCategories,
    ...controlCategories,
    operatorsCategory
  ];