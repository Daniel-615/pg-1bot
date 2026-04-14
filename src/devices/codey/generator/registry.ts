import type { ArduinoBaseGenerator } from "../../base/generator/generator";
import { registerCodeyActionGenerators } from "./actionGenerator";
import { registerCodeyAppearanceGenerators } from "./appearanceGenerator";
import { registerCodeyEmotionGenerators } from "./emotionGenerator";
import { registerCodeyInfraredGenerators } from "./infraredGenerator";
import { registerCodeyLightingGenerators } from "./lightingGenerator";
import { registerCodeyPythonGenerators } from "./pythonGenerator";
import { registerCodeySensorGenerators } from "./sensorGenerator";
import { registerCodeySpeakerGenerators } from "./speakerGenerator";

export type CodeyGeneratorRegistrar = (generator: ArduinoBaseGenerator) => void;

export const codeyGeneratorRegistrars: CodeyGeneratorRegistrar[] = [
  registerCodeyPythonGenerators,
  registerCodeyEmotionGenerators,
  registerCodeyAppearanceGenerators,
  registerCodeyLightingGenerators,
  registerCodeyActionGenerators,
  registerCodeySensorGenerators,
  registerCodeySpeakerGenerators,
  registerCodeyInfraredGenerators,
];
