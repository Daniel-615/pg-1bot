import * as Blockly from "blockly";
import { ArduinoUnoGenerator } from "../arduinoUno/generator";
export class ArduinoMegaGenerator extends ArduinoUnoGenerator {
  constructor() {
    super();
    this.name_="mega";
  }
  
  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,delay,HIGH,LOW,INPUT,OUTPUT"
    );
  }
}