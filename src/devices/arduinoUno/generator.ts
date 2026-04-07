import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator/generator";
import { registerDataGenerators } from "./generator/dataGenerator";
import { registerPinGenerators } from "./generator/pinGenerator";
import { registerSensorGenerators } from "./generator/sensorGenerator";
import { registerSerialGenerators } from "./generator/serialGenerator";

export class ArduinoUnoGenerator extends ArduinoBaseGenerator {
  constructor() {
    super("uno");
    registerSerialGenerators(this);
    registerPinGenerators(this);
    registerDataGenerators(this);
    registerSensorGenerators(this);
  }

  init(workspace: Blockly.Workspace) {
    super.init(workspace);

    this.addReservedWords(
      "setup,loop,pinMode,digitalWrite,digitalRead,analogRead,analogWrite,delay,delayMicroseconds,HIGH,LOW,INPUT,OUTPUT,Serial,pulseIn,tone,Servo"
    );
  }
}
