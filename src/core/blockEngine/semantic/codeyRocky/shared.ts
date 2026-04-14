import * as Blockly from "blockly";

export type Severity = "error" | "warning" | "suggestion";

export interface CodeyRockyHost {
  addIssue(block: Blockly.Block, message: string, severity?: Severity): void;
  inferValue(block: Blockly.Block | null): unknown;
  handleCheckUnusedExpression(block: Blockly.Block): void;
}

export interface CodeyRockyState {
  hasCodeyRockyConnect: boolean;
  hasCodeyIrLearned: boolean;
  lastCodeyDisplaySignature: string | null;
  lastCodeyLightingSignature: string | null;
  lastCodeySpeakerSignature: string | null;
  rockyStopped: boolean;
  codeyTimerResetSeen: boolean;
  codeyRotationResets: Set<string>;
}
