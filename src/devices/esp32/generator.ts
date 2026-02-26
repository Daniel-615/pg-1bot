import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator";
export class ESP32Generator extends ArduinoBaseGenerator {
    constructor(){
        super("ESP32");
    }
    init(workspace: Blockly.Workspace){
        super.init(workspace);
        this.addReservedWords(
            "setup,loop,pinMode,digitalWrite,delay,HIGH,LOW,INPUT,OUTPUT"
        )
    }
}