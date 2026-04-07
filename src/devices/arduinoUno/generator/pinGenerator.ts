import type { ArduinoUnoGenerator } from "../generator";
const ORDER_ATOMIC=0;
export function registerPinGenerators(generator: ArduinoUnoGenerator){
    generator.forBlock["arduino_uno_digital_read"] = (block)=>{
        const pin = block.getFieldValue("PIN") || "9";
        return [`digitalRead(${pin})`, ORDER_ATOMIC];   
    };
    generator.forBlock["arduino_uno_analog_read"] = (block) =>{
        const pin = block.getFieldValue("PIN") || "A0";
        return [`analogRead(${pin})`, ORDER_ATOMIC];   
    }
    generator.forBlock["arduino_uno_pulse_in"] = (block)=>{
        const pin = block.getFieldValue("PIN") || "13";
        const state= block.getFieldValue("STATE") || "HIGH";
        const timeout= block.getFieldValue("TIMEOUT");
        return [`pulseIn(${pin}, ${state}, ${timeout}UL)`, ORDER_ATOMIC];   
    }
    generator.forBlock["arduino_uno_digital_write"] = (block) =>{
        const pin = block.getFieldValue("PIN") || "9";
        const state= block.getFieldValue("STATE") || "HIGH";   
        if(!pin || !state){
            return "";
        }
        generator.addSetupDefinition(`pinMode(${pin}, OUTPUT);`, `uno_digital_${pin}`);
        return `digitalWrite(${pin}, ${state});\n`;
    }
    generator.forBlock["arduino_uno_pwm_write"] = (block) =>{
        const pin= block.getFieldValue("PIN") || "3";
        const value = block.getFieldValue("VALUE") || "0";
        if(!pin || !value){
            return "";
        }
        generator.addSetupDefinition(`pinMode(${pin}, OUTPUT);`, `uno_pwm_${pin}`);
        return `analogWrite(${pin}, ${value});\n`;   
    }
    generator.forBlock["arduino_uno_tone_play"] = (block) =>{

        const pin = block.getFieldValue("PIN") || "9";
        const frequency =block.getFieldValue("FREQUENCY") || "440";
        const duration = block.getFieldValue("DURATION") || "200";
        if (!pin || !frequency || !duration){
            return "";
        }
        return `tone(${pin}, ${frequency}, ${duration});\n`;
    }
    generator.forBlock["arduino_uno_servo_attach"] = (block)=>{
        const pin = block.getFieldValue("PIN") || "9";
        const instance = `_1botServo_${pin}`;
        if(!pin){
            return "";  
        }
        generator.addInclude("#include <Servo.h>");
        generator.addGlobalDefinition(`Servo ${instance};`, `uno_servo_decl_${pin}`);
        generator.addSetupDefinition(`${instance}.attach(${pin});`, `uno_servo_attach_${pin}`);
        return "";
    }   
    generator.forBlock["arduino_uno_servo_write"] = (block) =>{
        const pin = block.getFieldValue("PIN") || "9";
        const angle = block.getFieldValue("ANGLE") || "0";
        if(!angle || !pin){
            return "";  
        }
        const instace = `_1botServo_${pin}`;
        generator.addInclude("#include <Servo.h>");
        generator.addGlobalDefinition(`Servo ${instace};`, `uno_servo_decl_${pin}`);
        generator.addSetupDefinition(`${instace}.attach(${pin});`, `uno_servo_attach_${pin}`);
        return `${instace}.write(${angle});\n`;   
    }
}