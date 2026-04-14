import type { CodeyBlockDefinition } from "./types";
import { actionBlocks } from "./actionBlocks";
import { appearanceBlocks } from "./appearanceBlocks";
import { emotionBlocks } from "./emotionBlocks";
import { infraredBlocks } from "./infraredBlocks";
import { lightingBlocks } from "./lightingBlocks";
import { sensorBlocks } from "./sensorBlocks";
import { speakerBlocks } from "./speakerBlocks";

export const codeyBlockGroups: CodeyBlockDefinition[][] = [
  emotionBlocks,
  appearanceBlocks,
  lightingBlocks,
  speakerBlocks,
  actionBlocks,
  sensorBlocks,
  infraredBlocks,
];
