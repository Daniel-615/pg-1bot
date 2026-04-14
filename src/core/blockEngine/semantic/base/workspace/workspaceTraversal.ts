import * as Blockly from "blockly";

interface WorkspaceTraversalOptions {
  debugMode: boolean;
  queueBlock: (block: Blockly.Block) => void;
  visitBlock: (block: Blockly.Block) => void;
}

export class WorkspaceTraversal {
  private readonly debugMode: boolean;
  private readonly queueBlock: (block: Blockly.Block) => void;
  private readonly visitBlock: (block: Blockly.Block) => void;

  constructor(options: WorkspaceTraversalOptions) {
    this.debugMode = options.debugMode;
    this.queueBlock = options.queueBlock;
    this.visitBlock = options.visitBlock;
  }

  traverseChildren(block: Blockly.Block) {
    block.inputList.forEach((input) => {
      const child = input.connection?.targetBlock();
      if (!child) return;

      if (this.debugMode) {
        this.queueBlock(child);
      } else {
        this.visitBlock(child);
      }
    });

    const next = block.getNextBlock();
    if (!next) return;

    if (this.debugMode) {
      this.queueBlock(next);
      return;
    }

    this.visitBlock(next);
  }

  traverseNextBlock(block: Blockly.Block) {
    const next = block.getNextBlock();
    if (!next) return;

    if (this.debugMode) {
      this.queueBlock(next);
      return;
    }

    this.visitBlock(next);
  }

  traverseControlBlock(block: Blockly.Block, inputNames: string[]) {
    inputNames.forEach((inputName) => {
      const child = block.getInputTargetBlock(inputName);
      if (!child) return;

      if (this.debugMode) {
        this.queueBlock(child);
      } else {
        this.visitBlock(child);
      }
    });

    this.traverseNextBlock(block);
  }
}
