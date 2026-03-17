import * as Blockly from "blockly";
import { ArduinoBaseGenerator } from "../base/generator/generator";
export class ESP32Generator extends ArduinoBaseGenerator {
    constructor(){
        super("ESP32");
    }
    init(workspace: Blockly.Workspace){
        super.init(workspace);
        this.addReservedWords(
            "setup,loop,pinMode,digitalWrite,delay,HIGH,LOW,INPUT,OUTPUT"
        )
        this.forBlock["program_start"]= (block)=>{
            const body= this.statementToCode(block,"DO");
            return `
            void setup(){
                Serial.begin(115200);
                delay(100);
                ${Array.from(this.setupDefinitions).join("\n")}
            }
            void loop(){
                ${body}
            }    
            `;

        }
    }
}