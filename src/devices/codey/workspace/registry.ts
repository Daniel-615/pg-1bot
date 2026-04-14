import { getCodeyActionCategories } from "./actionCategorie";
import { getCodeyAppearanceCategories } from "./appearanceCategorie";
import { getCodeyEmotionCategories } from "./emotionCategorie";
import { getCodeyInfraredCategories } from "./infraredCategorie";
import { getCodeyLightingCategories } from "./lightingCategorie";
import { getSensorsCategories } from "./sensorsCategories";
import { getCodeySpeakerCategories } from "./speakerCategorie";

export type CodeyCategoryGetter = () => any[];

export const codeyCategoryGetters: CodeyCategoryGetter[] = [
  getCodeyEmotionCategories,
  getCodeyAppearanceCategories,
  getCodeyLightingCategories,
  getCodeySpeakerCategories,
  getCodeyActionCategories,
  getSensorsCategories,
  getCodeyInfraredCategories,
];
