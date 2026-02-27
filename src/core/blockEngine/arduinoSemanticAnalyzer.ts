import * as Blockly from "blockly";

export class ArduinoSemanticAnalyzer {
  analyze(workspace: Blockly.Workspace) {
    const errors = new Map<string, string[]>();

    const addError = (block: Blockly.Block, message: string) => {
      const id = block.id;

      if (!errors.has(id)) {
        errors.set(id, []);
      }

      errors.get(id)!.push(message);
    };

    workspace.getAllBlocks(false).forEach((block) => {
      block.setWarningText(null);
      this.checkInvalidTypeOperation(block,addError); 
    });

    this.checkUninitializedVariables(workspace, addError);
    this.checkTypeConsistency(workspace, addError);
    this.checkDuplicateVariables(workspace,addError);

    this.checkBodyControl(workspace,addError)
    workspace.getAllBlocks(false).forEach((block) => {
      this.checkDivisionByZero(block, addError);
      this.checkBooleanCondition(block, addError);
    });

    // Aplicar todos los errores acumulados
    errors.forEach((messages, blockId) => {
      const block = workspace.getBlockById(blockId);
      if (block) {
        block.setWarningText(messages.join("\n"));
      }
    });
  }
  private checkDuplicateVariables(
    workspace: Blockly.Workspace,
    addError: (block: Blockly.Block, message: string)=> void
  ){
    const topBlocks=workspace.getTopBlocks(true);
    const visitBlock=(block:Blockly.Block | null, declared: Set<string>)=>{
      while(block){
        if(block.type==="variables_set"){
          const varName=block.getFieldValue("VAR");
          if(declared.has(varName)){
            addError(block, `Variable duplicada: ${varName}`);
          }else{
            declared.add(varName)
          }
        }
        block.inputList.forEach((input)=>{
          visitBlock(input.connection?.targetBlock() || null , declared);
        });
        block=block.getNextBlock();
      }
    }
    topBlocks.forEach((block)=> visitBlock(block,new Set()));
  }
  private checkUninitializedVariables(
    workspace: Blockly.Workspace,
    addError: (block: Blockly.Block, message: string) => void
  ) {
    const assignedVars = new Set<string>();
    const topBlocks = workspace.getTopBlocks(true);

    const visitBlock = (block: Blockly.Block | null) => {
      while (block) {
        if (block.type === "variables_set") {
          const varName = block.getFieldValue("VAR");
          assignedVars.add(varName);
        }

        if (block.type === "variables_get") {
          const varName = block.getFieldValue("VAR");

          if (!assignedVars.has(varName)) {
            addError(block, "Variable no inicializada");
          }
        }

        block.inputList.forEach((input) => {
          visitBlock(input.connection?.targetBlock() || null);
        });

        block = block.getNextBlock();
      }
    };

    topBlocks.forEach((block) => visitBlock(block));
  }

  private checkTypeConsistency(
    workspace: Blockly.Workspace,
    addError: (block: Blockly.Block, message: string) => void,
  ) {
    const variableTypes = new Map<string, string>();
    const topBlocks = workspace.getTopBlocks(true);

    const inferType = (block: Blockly.Block | null): string | null => {
      if (!block) return null;

      switch (block.type) {
        case "math_number":
        case "math_arithmetic":
          return "number";

        case "logic_boolean":
        case "logic_compare":
        case "logic_operation":
        case "logic_negate":
          return "boolean";

        case "variables_get":
          return variableTypes.get(block.getFieldValue("VAR")) || null;

        default:
          return null;
      }
    };

    const visitBlock = (block: Blockly.Block | null) => {
      while (block) {
        if (block.type === "variables_set") {
          const varName = block.getFieldValue("VAR");
          const valueBlock = block.getInputTargetBlock("VALUE");
          const inferredType = inferType(valueBlock);

          if (!inferredType) {
            block = block.getNextBlock();
            continue;
          }

          if (!variableTypes.has(varName)) {
            variableTypes.set(varName, inferredType);
          } else {
            const existingType = variableTypes.get(varName);

            if (existingType !== inferredType) {
              addError(
                block,
                `Tipo incompatible. Esperado: ${existingType}, recibido: ${inferredType}`,
              );
            }
          }
        }

        block.inputList.forEach((input) => {
          visitBlock(input.connection?.targetBlock() || null);
        });

        block = block.getNextBlock();
      }
    };

    topBlocks.forEach((block) => visitBlock(block));
  }

  private checkDivisionByZero(
    block: Blockly.Block,
    addError: (block: Blockly.Block, message: string) => void,
  ) {
    if (block.type !== "math_arithmetic") return;

    const operator = block.getFieldValue("OP");

    if (operator === "DIVIDE") {
      const divisorBlock = block.getInputTargetBlock("B");

      if (
        divisorBlock &&
        divisorBlock.type === "math_number" &&
        divisorBlock.getFieldValue("NUM") === "0"
      ) {
        addError(block, "División por cero");
      }
    }
  }
    //estructuras de control como if, while, for
    private checkBodyControl(
    workspace: Blockly.Workspace,
    addError: (block: Blockly.Block, message: string) => void
  ) {
    const controlBlocks = ["controls_if", "controls_repeat_ext", "controls_whileUntil", "controls_for"];
    
    workspace.getAllBlocks(false).forEach((block) => {
      if (!controlBlocks.includes(block.type)) return;

      // Revisión de cada entrada de ejecución
      block.inputList.forEach((input) => {
        if (input.connection && input.connection.getCheck()?.includes("Statement")) {
          const childBlock = input.connection.targetBlock();
          if (!childBlock) {
            addError(block, "El cuerpo del bloque de control está vacío.");
          }
        }
      });
    });
  }
      
  private checkInvalidTypeOperation(
    block: Blockly.Block,
    addError: (block: Blockly.Block, message: string) => void,
  ) {
    if (block.type !== "math_arithmetic") return;

    const getType = (b: Blockly.Block | null): string | null => {
      if (!b) return null;
      switch (b.type) {
        case "math_number":
        case "math_arithmetic":
          return "number";
        case "text":
          return "string";
        case "variables_get":
          return null; // opcional: consultar mapa de tipos
        default:
          return null;
      }
    };

    const inputA = block.getInputTargetBlock("A");
    const inputB = block.getInputTargetBlock("B");
    const typeA = getType(inputA);
    const typeB = getType(inputB);

    if (!typeA || !typeB) return; 

    const operator = block.getFieldValue("OP"); 

    if (operator === "ADD") {
      if (
        (typeA === "string" && typeB === "number") ||
        (typeA === "number" && typeB === "string")
      ) {
        addError(block, "Operación inválida: no se puede sumar String + Number");
      }
    }
  }
  private checkBooleanCondition(
    block: Blockly.Block,
    addError: (block: Blockly.Block, message: string) => void,
  ) {
    const booleanInputs = block.inputList.filter((input) => {
        const checks=input.connection?.getCheck();
        //si checks es null, (no es un bloque de condición) 
        // se devuelve false, si checks incluye "Boolean" se devuelve true
        return checks !==null && checks?.includes("Boolean"); 
    });
    booleanInputs.forEach((input) => {
      const conditionBlock = input.connection?.targetBlock();
      if (!conditionBlock) {
        addError(block, "La condición está vacía");
        return;
      }
      const validBooleanBlocks = [
        "logic_boolean",
        "logic_compare",
        "logic_operation",
        "logic_negate",
      ];
      if (!validBooleanBlocks.includes(conditionBlock.type)) {
        addError(block, "La condición debe ser de tipo booleano");
      }
    });
  }
}
