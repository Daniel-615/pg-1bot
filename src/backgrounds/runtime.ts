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

type BackgroundValue = number | string | boolean;

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
  "background_set_x",
  "background_set_y",
  "background_point_direction",
  "background_reset_position",
  "background_say",
  "background_hide_message",
  "background_set_actor",
  "background_set_scene",
  "background_wait_ms",
  "variables_set",
  "variables_set_dynamic",
  "if",
  "if_else",
  "for_range",
  "while_repeat",
  "do_while",
  "repeat_until",
]);

const MAX_BACKGROUND_LOOP_ITERATIONS = 100;

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

function evaluateValue(
  block: Blockly.Block | null,
  fallback: BackgroundValue = 0,
  variables: Record<string, number> = {}
): BackgroundValue {
  if (!block) {
    return fallback;
  }

  switch (block.type) {
    case "string":
      return readText(block, "STRING");

    case "logic_boolean":
    case "logic_greater":
    case "logic_less":
    case "logic_equal":
    case "logic_and":
    case "logic_or":
    case "logic_not":
      return evaluateBoolean(block, variables);

    default:
      return evaluateNumber(block, typeof fallback === "number" ? fallback : 0, variables);
  }
}

function toBoolean(value: BackgroundValue) {
  if (typeof value === "string") {
    return value.length > 0;
  }

  return Boolean(value);
}

function evaluateBoolean(
  block: Blockly.Block | null,
  variables: Record<string, number> = {}
) {
  if (!block) {
    return false;
  }

  switch (block.type) {
    case "logic_boolean":
      return block.getFieldValue("BOOL") === "TRUE";

    case "logic_greater":
      return evaluateValue(block.getInputTargetBlock("A"), 0, variables) > evaluateValue(block.getInputTargetBlock("B"), 0, variables);

    case "logic_less":
      return evaluateValue(block.getInputTargetBlock("A"), 0, variables) < evaluateValue(block.getInputTargetBlock("B"), 0, variables);

    case "logic_equal":
      return evaluateValue(block.getInputTargetBlock("A"), 0, variables) === evaluateValue(block.getInputTargetBlock("B"), 0, variables);

    case "logic_and":
      return toBoolean(evaluateValue(block.getInputTargetBlock("A"), false, variables)) && toBoolean(evaluateValue(block.getInputTargetBlock("B"), false, variables));

    case "logic_or":
      return toBoolean(evaluateValue(block.getInputTargetBlock("A"), false, variables)) || toBoolean(evaluateValue(block.getInputTargetBlock("B"), false, variables));

    case "logic_not":
      return !toBoolean(evaluateValue(block.getInputTargetBlock("BOOL"), false, variables));

    default:
      return toBoolean(evaluateValue(block, 0, variables));
  }
}

function readText(block: Blockly.Block, field: string) {
  return String(block.getFieldValue(field) ?? "");
}

function evaluateMessage(block: Blockly.Block | null, variables: Record<string, number>) {
  if (!block) {
    return "";
  }

  const value = evaluateValue(block, "", variables);
  return typeof value === "boolean" ? (value ? "verdadero" : "falso") : String(value);
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

    case "background_set_x":
      return {
        ...state,
        x: clamp(evaluateNumber(block.getInputTargetBlock("X"), readNumber(block, "X"), state.variables)),
      };

    case "background_set_y":
      return {
        ...state,
        y: clamp(evaluateNumber(block.getInputTargetBlock("Y"), readNumber(block, "Y"), state.variables)),
      };

    case "background_point_direction":
      return {
        ...state,
        direction: evaluateNumber(block.getInputTargetBlock("DEGREES"), readNumber(block, "DEGREES"), state.variables) % 360,
      };

    case "background_reset_position":
      return {
        ...state,
        x: 0,
        y: 0,
        direction: 0,
      };

    case "background_say":
      return {
        ...state,
        message: evaluateMessage(block.getInputTargetBlock("TEXT"), state.variables),
      };

    case "background_hide_message":
      return {
        ...state,
        message: "",
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

    case "if":
      return evaluateBoolean(block.getInputTargetBlock("CONDITION"), state.variables)
        ? runStatementChain(block.getInputTargetBlock("IF_BODY"), state)
        : state;

    case "if_else":
      return evaluateBoolean(block.getInputTargetBlock("CONDITION"), state.variables)
        ? runStatementChain(block.getInputTargetBlock("IF_BODY"), state)
        : runStatementChain(block.getInputTargetBlock("ELSE_BODY"), state);

    case "for_range": {
      const variableName = getVariableName(block);
      const from = evaluateNumber(block.getInputTargetBlock("FROM"), 0, state.variables);
      const to = evaluateNumber(block.getInputTargetBlock("TO"), 0, state.variables);
      const stepValue = Number(block.getFieldValue("STEP") ?? 1);
      const step = stepValue === 0 ? 1 : stepValue;
      let nextState = state;
      let iterations = 0;

      for (let value = from; step > 0 ? value <= to : value >= to; value += step) {
        if (iterations >= MAX_BACKGROUND_LOOP_ITERATIONS) {
          break;
        }

        nextState = {
          ...nextState,
          variables: variableName ? { ...nextState.variables, [variableName]: value } : nextState.variables,
        };
        nextState = runStatementChain(block.getInputTargetBlock("BODY"), nextState);
        iterations += 1;
      }

      return nextState;
    }

    case "while_repeat": {
      let nextState = state;
      let iterations = 0;

      while (evaluateBoolean(block.getInputTargetBlock("CONDITION"), nextState.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS) {
        nextState = runStatementChain(block.getInputTargetBlock("BODY"), nextState);
        iterations += 1;
      }

      return nextState;
    }

    case "do_while": {
      let nextState = state;
      let iterations = 0;

      do {
        nextState = runStatementChain(block.getInputTargetBlock("BODY"), nextState);
        iterations += 1;
      } while (evaluateBoolean(block.getInputTargetBlock("CONDITION"), nextState.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS);

      return nextState;
    }

    case "repeat_until": {
      let nextState = state;
      let iterations = 0;

      while (!evaluateBoolean(block.getInputTargetBlock("CONDITION"), nextState.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS) {
        nextState = runStatementChain(block.getInputTargetBlock("BODY"), nextState);
        iterations += 1;
      }

      return nextState;
    }

    default:
      return state;
  }
}

function runStatementChain(
  block: Blockly.Block | null,
  currentState: BackgroundActorState
) {
  let state = currentState;
  let currentBlock = block;

  while (currentBlock) {
    state = runBlock(currentBlock, state);
    currentBlock = currentBlock.getNextBlock();
  }

  return state;
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
    const block: Blockly.Block | null =
      chain.type === "background_when_run" ? chain.getNextBlock() : chain;

    state = runStatementChain(block, state);
  }

  return state;
}

async function playStatementChain(
  block: Blockly.Block | null,
  currentState: BackgroundActorState,
  onStep: (state: BackgroundActorState) => void
) {
  let state = currentState;
  let currentBlock = block;

  while (currentBlock) {
    switch (currentBlock.type) {
      case "background_wait_ms":
        await sleep(Math.min(evaluateNumber(currentBlock.getInputTargetBlock("TIME"), readNumber(currentBlock, "TIME"), state.variables), 3000));
        break;

      case "if":
        if (evaluateBoolean(currentBlock.getInputTargetBlock("CONDITION"), state.variables)) {
          state = await playStatementChain(currentBlock.getInputTargetBlock("IF_BODY"), state, onStep);
        }
        break;

      case "if_else":
        state = await playStatementChain(
          evaluateBoolean(currentBlock.getInputTargetBlock("CONDITION"), state.variables)
            ? currentBlock.getInputTargetBlock("IF_BODY")
            : currentBlock.getInputTargetBlock("ELSE_BODY"),
          state,
          onStep
        );
        break;

      case "for_range": {
        const variableName = getVariableName(currentBlock);
        const from = evaluateNumber(currentBlock.getInputTargetBlock("FROM"), 0, state.variables);
        const to = evaluateNumber(currentBlock.getInputTargetBlock("TO"), 0, state.variables);
        const stepValue = Number(currentBlock.getFieldValue("STEP") ?? 1);
        const step = stepValue === 0 ? 1 : stepValue;
        let iterations = 0;

        for (let value = from; step > 0 ? value <= to : value >= to; value += step) {
          if (iterations >= MAX_BACKGROUND_LOOP_ITERATIONS) {
            break;
          }

          state = {
            ...state,
            variables: variableName ? { ...state.variables, [variableName]: value } : state.variables,
          };
          state = await playStatementChain(currentBlock.getInputTargetBlock("BODY"), state, onStep);
          iterations += 1;
        }
        break;
      }

      case "while_repeat": {
        let iterations = 0;

        while (evaluateBoolean(currentBlock.getInputTargetBlock("CONDITION"), state.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS) {
          state = await playStatementChain(currentBlock.getInputTargetBlock("BODY"), state, onStep);
          iterations += 1;
        }
        break;
      }

      case "do_while": {
        let iterations = 0;

        do {
          state = await playStatementChain(currentBlock.getInputTargetBlock("BODY"), state, onStep);
          iterations += 1;
        } while (evaluateBoolean(currentBlock.getInputTargetBlock("CONDITION"), state.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS);
        break;
      }

      case "repeat_until": {
        let iterations = 0;

        while (!evaluateBoolean(currentBlock.getInputTargetBlock("CONDITION"), state.variables) && iterations < MAX_BACKGROUND_LOOP_ITERATIONS) {
          state = await playStatementChain(currentBlock.getInputTargetBlock("BODY"), state, onStep);
          iterations += 1;
        }
        break;
      }

      default:
        state = runBlock(currentBlock, state);
        onStep(state);
        await sleep(220);
        break;
    }

    currentBlock = currentBlock.getNextBlock();
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
    const block: Blockly.Block | null =
      chain.type === "background_when_run" ? chain.getNextBlock() : chain;

    state = await playStatementChain(block, state, onStep);
  }

  return state;
}
