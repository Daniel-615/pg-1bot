import type { Board } from "../../boards/Board";
import { defineCodeyBlocks } from "./blocks/blocks";
import { CodeyGenerator } from "./generator";
let codeyBlocksRegistered= false;
export class CodeyBoard implements Board<CodeyGenerator> {
  type= "codey";
  getGenerator(): CodeyGenerator{
    return new CodeyGenerator();
  }
  registerBlocks(){
    if(codeyBlocksRegistered){
      return;
    }
    defineCodeyBlocks();
    codeyBlocksRegistered = true;

  }
}
