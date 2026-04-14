import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator/generator";
import { codeyGeneratorRegistrars } from "./generator/registry";

export class CodeyGenerator extends ArduinoBaseGenerator {
  constructor() {
    super("codey");

    for (const register of codeyGeneratorRegistrars) {
      register(this);
    }
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "codey,rocky,event,time,random,True,False,None,print,range,int,len,min,max"
    );
  }
}
