import { hardwareCategories } from "./hardware/hardwareCategories";
import { operatorsCategory } from "./operators/operatorsCategory";
import { typesCategories } from "./types/typesCategories";
import { controlCategories } from "./control/controlCategories";
export const baseCategories = [
    {
      kind: "category",
      name: "VARIABLES",
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
          type: "lists_getIndex"
        },
        {
          kind: "block",
          type: "lists_setIndex"
        }
      ]
    },
    ...hardwareCategories,
    ...typesCategories,
    ...controlCategories,
    operatorsCategory
  ];