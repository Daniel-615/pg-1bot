import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator/generator";

export class CodeyGenerator extends ArduinoBaseGenerator {
  constructor() {
    super("codey");
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,delay,HIGH,LOW,INPUT,OUTPUT"
    );
  }
}