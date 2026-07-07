import type * as Blockly from "blockly";

export type BackgroundScene = "classroom" | "space" | "grid" | "custom";
export type BackgroundActor = "robot" | "custom";

export type BackgroundActorState = {
  x: number;
  y: number;
  direction: number;
  scene: BackgroundScene;
  actor: BackgroundActor;
  variables: Record<string, number>;
  customImageUrl: string | null;
  customActorUrl: string | null;
  message: string;
};

export const backgroundScenes: Array<{ id: BackgroundScene; label: string }> = [
  { id: "classroom", label: "Aula" },
  { id: "space", label: "Espacio" },
  { id: "grid", label: "Cuadricula" },
  { id: "custom", label: "Imagen importada" },
];

export const initialBackgroundState: BackgroundActorState = {
  x: 0,
  y: 0,
  direction: 0,
  scene: "classroom",
  actor: "robot",
  variables: {},
  customImageUrl: null,
  customActorUrl: null,
  message: "",
};

const BACKGROUND_BLOCKS = new Set([
  "background_when_run",
  "background_move_steps",
  "background_turn_degrees",
  "background_go_to",
  "background_change_x",
  "background_change_y",
  "background_say",
  "background_set_actor",
  "background_set_scene",
  "background_wait_ms",
  "variables_set",
  "variables_set_dynamic",
]);

function clamp(value: number) {
  return Math.max(-78, Math.min(78, value));
}

function readNumber(block: Blockly.Block, field: string, fallback = 0) {
  const inputBlock = block.getInputTargetBlock(field);

  if (inputBlock) {
    return evaluateNumber(inputBlock, fallback);
  }

  const value = Number(block.getFieldValue(field));
  return Number.isFinite(value) ? value : fallback;
}

function getVariableName(block: Blockly.Block, field = "VAR") {
  const variableId = block.getFieldValue(field);

  if (!variableId) {
    return "";
  }

  const variable = block.workspace.getVariableMap().getVariableById(String(variableId));
  return variable?.getName?.() ?? String(variableId);
}

function evaluateNumber(
  block: Blockly.Block | null,
  fallback = 0,
  variables: Record<string, number> = {}
): number {
  if (!block) {
    return fallback;
  }

  switch (block.type) {
    case "number":
    case "math_number":
      return readNumber(block, "NUM", fallback);

    case "variables_get":
    case "variables_get_dynamic":
      return variables[getVariableName(block)] ?? fallback;

    case "math_add":
      return evaluateNumber(block.getInputTargetBlock("A"), 0, variables) + evaluateNumber(block.getInputTargetBlock("B"), 0, variables);

    case "math_subtract":
      return evaluateNumber(block.getInputTargetBlock("A"), 0, variables) - evaluateNumber(block.getInputTargetBlock("B"), 0, variables);

    case "math_multiply":
      return evaluateNumber(block.getInputTargetBlock("A"), 0, variables) * evaluateNumber(block.getInputTargetBlock("B"), 0, variables);

    case "math_divide": {
      const divisor = evaluateNumber(block.getInputTargetBlock("B"), 1, variables);
      return divisor === 0 ? fallback : evaluateNumber(block.getInputTargetBlock("A"), 0, variables) / divisor;
    }

    case "math_sqrt":
      return Math.sqrt(Math.max(0, evaluateNumber(block.getInputTargetBlock("VALUE"), 0, variables)));

    case "math_power":
      return Math.pow(
        evaluateNumber(block.getInputTargetBlock("BASE"), 0, variables),
        evaluateNumber(block.getInputTargetBlock("EXPONENT"), 1, variables)
      );

    case "math_random": {
      const min = evaluateNumber(block.getInputTargetBlock("MIN"), 0, variables);
      const max = evaluateNumber(block.getInputTargetBlock("MAX"), 10, variables);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    default:
      return fallback;
  }
}

function readText(block: Blockly.Block, field: string) {
  return String(block.getFieldValue(field) ?? "");
}

function evaluateMessage(block: Blockly.Block | null, variables: Record<string, number>) {
  if (!block) {
    return "";
  }

  if (block.type === "string") {
    return readText(block, "STRING");
  }

  if (block.type === "logic_boolean") {
    return block.getFieldValue("BOOL") === "TRUE" ? "verdadero" : "falso";
  }

  return String(evaluateNumber(block, 0, variables));
}

function isBackgroundBlock(block: Blockly.Block) {
  return BACKGROUND_BLOCKS.has(block.type);
}

function getBackgroundChains(workspace: Blockly.Workspace) {
  return workspace.getTopBlocks(true).filter(isBackgroundBlock);
}

function runBlock(block: Blockly.Block, state: BackgroundActorState) {
  switch (block.type) {
    case "variables_set":
    case "variables_set_dynamic": {
      const variableName = getVariableName(block);
      const value = evaluateNumber(block.getInputTargetBlock("VALUE"), 0, state.variables);

      if (!variableName) {
        return state;
      }

      return {
        ...state,
        variables: {
          ...state.variables,
          [variableName]: value,
        },
      };
    }

    case "background_move_steps": {
      const steps = evaluateNumber(block.getInputTargetBlock("STEPS"), readNumber(block, "STEPS"), state.variables);
      const radians = (state.direction * Math.PI) / 180;
      return {
        ...state,
        x: clamp(state.x + Math.cos(radians) * steps),
        y: clamp(state.y + Math.sin(radians) * steps),
      };
    }

    case "background_turn_degrees":
      return {
        ...state,
        direction: (state.direction + evaluateNumber(block.getInputTargetBlock("DEGREES"), readNumber(block, "DEGREES"), state.variables)) % 360,
      };

    case "background_go_to":
      return {
        ...state,
        x: clamp(evaluateNumber(block.getInputTargetBlock("X"), readNumber(block, "X"), state.variables)),
        y: clamp(evaluateNumber(block.getInputTargetBlock("Y"), readNumber(block, "Y"), state.variables)),
      };

    case "background_change_x":
      return {
        ...state,
        x: clamp(state.x + evaluateNumber(block.getInputTargetBlock("DX"), readNumber(block, "DX"), state.variables)),
      };

    case "background_change_y":
      return {
        ...state,
        y: clamp(state.y + evaluateNumber(block.getInputTargetBlock("DY"), readNumber(block, "DY"), state.variables)),
      };

    case "background_say":
      return {
        ...state,
        message: evaluateMessage(block.getInputTargetBlock("TEXT"), state.variables),
      };

    case "background_set_actor": {
      const actor = readText(block, "ACTOR") as BackgroundActor;
      const nextActor: BackgroundActor = actor === "custom" && state.customActorUrl ? "custom" : "robot";

      return {
        ...state,
        actor: nextActor,
      };
    }

    case "background_set_scene": {
      const scene = readText(block, "SCENE") as BackgroundScene;
      return {
        ...state,
        scene: backgroundScenes.some((item) => item.id === scene) ? scene : state.scene,
      };
    }

    default:
      return state;
  }
}

function sleep(milliseconds: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

export function runBackgroundProgram(
  workspace: Blockly.Workspace | null,
  currentState: BackgroundActorState
) {
  if (!workspace) {
    return currentState;
  }

  let state: BackgroundActorState = { ...currentState };
  const chains = getBackgroundChains(workspace);

  for (const chain of chains) {
    let block: Blockly.Block | null =
      chain.type === "background_when_run" ? chain.getNextBlock() : chain;

    while (block) {
      state = runBlock(block, state);
      block = block.getNextBlock();
    }
  }

  return state;
}

export async function playBackgroundProgram(
  workspace: Blockly.Workspace | null,
  currentState: BackgroundActorState,
  onStep: (state: BackgroundActorState) => void
) {
  if (!workspace) {
    return currentState;
  }

  let state: BackgroundActorState = { ...currentState };
  const chains = getBackgroundChains(workspace);

  for (const chain of chains) {
    let block: Blockly.Block | null =
      chain.type === "background_when_run" ? chain.getNextBlock() : chain;

    while (block) {
      if (block.type === "background_wait_ms") {
        await sleep(Math.min(evaluateNumber(block.getInputTargetBlock("TIME"), readNumber(block, "TIME"), state.variables), 3000));
      } else {
        state = runBlock(block, state);
        onStep(state);
        await sleep(220);
      }

      block = block.getNextBlock();
    }
  }

  return state;
}
