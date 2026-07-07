import type { ArduinoBaseGenerator } from "../generator";
const ORDER_NONE=99;
const ORDER_ATOMIC=0;
export function registerOperatorsMathematicsGenerator(generator: ArduinoBaseGenerator){
    generator.forBlock["math_add"] =(block)=>{
      const A=generator.valueToCode(block,"A", ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block,"B", ORDER_ATOMIC) || "0";
      return [`${A} + ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["math_subtract"]= (block) =>{
      const A= generator.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} - ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["math_multiply"]= (block) =>{
      const A= generator.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} * ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["math_divide"]= (block) =>{
      const A= generator.valueToCode(block, "A",ORDER_ATOMIC) || "0";
      const B= generator.valueToCode(block, "B",ORDER_ATOMIC) || "0";
      return [`${A} / ${B}`, ORDER_ATOMIC];
    }
    generator.forBlock["math_sqrt"] = (block) => {
      const value = generator.valueToCode(block, "VALUE", ORDER_ATOMIC) || "0";
      return [`sqrt(${value})`, ORDER_ATOMIC];
    };
    generator.forBlock["math_power"] = (block) => {
      const base = generator.valueToCode(block, "BASE", ORDER_ATOMIC) || "0";
      const exponent = generator.valueToCode(block, "EXPONENT", ORDER_ATOMIC) || "1";
      return [`pow(${base}, ${exponent})`, ORDER_ATOMIC];
    };
    generator.forBlock["math_random"] = (block) => {
      const min = generator.valueToCode(block, "MIN", ORDER_NONE) || "0";
      const max = generator.valueToCode(block, "MAX", ORDER_NONE) || "10";

      return [`random(${min}, ${max})`, ORDER_ATOMIC];
    };
}
