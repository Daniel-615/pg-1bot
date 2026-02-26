import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator";

export class ArduinoUnoGenerator extends ArduinoBaseGenerator {
  constructor() {
    super("ArduinoUno");
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,delay,HIGH,LOW,INPUT,OUTPUT"
    );
  }
}