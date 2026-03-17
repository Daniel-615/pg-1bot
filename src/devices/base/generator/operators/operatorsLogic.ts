import type { ArduinoBaseGenerator } from "../generator";
const ORDER_ATOMIC = 0;
export function registerOperatorsLogicGenerator(generator: ArduinoBaseGenerator){
    generator.forBlock["logic_boolean"] = (block) =>{
      const bool= block.getFieldValue("BOOL");
      return [bool.toLowerCase(), ORDER_ATOMIC]
    }
    
    generator.forBlock["logic_greater"]= (block) =>{
      const A= generator.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} > ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["logic_less"]= (block) =>{
      const A= generator.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} < ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["logic_equal"] = (block) => {
      const A = generator.valueToCode(block, "A", ORDER_ATOMIC) || "0";
      const B = generator.valueToCode(block, "B", ORDER_ATOMIC) || "0";
      return [`${A} == ${B}`, ORDER_ATOMIC];
    };
    
    generator.forBlock["logic_and"]= (block)=>{
      const A= generator.valueToCode(block, "A", ORDER_ATOMIC) || "true";
      const B= generator.valueToCode(block, "B", ORDER_ATOMIC) || "false";
      return [`${A} && ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["logic_or"]= (block)=>{
      const A= generator.valueToCode(block, "A", ORDER_ATOMIC) || "false";
      const B= generator.valueToCode(block, "B", ORDER_ATOMIC) || "false";
      return [`${A} || ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["logic_not"]= (block)=>{
      const value= generator.valueToCode(block, "BOOL", ORDER_ATOMIC) || "false";
      return [`!${value}`, ORDER_ATOMIC];
    }
}