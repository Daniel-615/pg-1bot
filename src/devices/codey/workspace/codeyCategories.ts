import { codeyCategoryGetters } from "./registry";

export function getCodeyCategories(extraCategories: any[] = []) {
  return [
    ...codeyCategoryGetters.flatMap((getCategories) => getCategories()),
    ...extraCategories,
  ];
}
