import * as Blockly from "blockly";
import { ArduinoUnoGenerator } from "../arduinoUno/generator";

export class ArduinoNanoGenerator extends ArduinoUnoGenerator {
  constructor() {
    super();
    this.name_ = "nano";
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,digitalRead,analogRead,analogWrite,delay,delayMicroseconds,HIGH,LOW,INPUT,OUTPUT,Serial,pulseIn,tone,Servo"
    );
  }
}
