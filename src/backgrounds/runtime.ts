import type * as Blockly from "blockly";

export type BackgroundScene = "classroom" | "space" | "grid";

export type BackgroundActorState = {
  x: number;
  y: number;
  direction: number;
  scene: BackgroundScene;
  message: string;
};

export const backgroundScenes: Array<{ id: BackgroundScene; label: string }> = [
  { id: "classroom", label: "Aula" },
  { id: "space", label: "Espacio" },
  { id: "grid", label: "Cuadricula" },
];

export const initialBackgroundState: BackgroundActorState = {
  x: 0,
  y: 0,
  direction: 0,
  scene: "classroom",
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
  "background_set_scene",
  "background_wait_ms",
]);

function clamp(value: number) {
  return Math.max(-78, Math.min(78, value));
}

function readNumber(block: Blockly.Block, field: string, fallback = 0) {
  const value = Number(block.getFieldValue(field));
  return Number.isFinite(value) ? value : fallback;
}

function readText(block: Blockly.Block, field: string) {
  return String(block.getFieldValue(field) ?? "");
}

function isBackgroundBlock(block: Blockly.Block) {
  return BACKGROUND_BLOCKS.has(block.type);
}

function getBackgroundChains(workspace: Blockly.Workspace) {
  return workspace.getTopBlocks(true).filter(isBackgroundBlock);
}

function runBlock(block: Blockly.Block, state: BackgroundActorState) {
  switch (block.type) {
    case "background_move_steps": {
      const steps = readNumber(block, "STEPS");
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
        direction: (state.direction + readNumber(block, "DEGREES")) % 360,
      };

    case "background_go_to":
      return {
        ...state,
        x: clamp(readNumber(block, "X")),
        y: clamp(readNumber(block, "Y")),
      };

    case "background_change_x":
      return {
        ...state,
        x: clamp(state.x + readNumber(block, "DX")),
      };

    case "background_change_y":
      return {
        ...state,
        y: clamp(state.y + readNumber(block, "DY")),
      };

    case "background_say":
      return {
        ...state,
        message: readText(block, "TEXT"),
      };

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

  let state = { ...currentState };
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

  let state = { ...currentState };
  const chains = getBackgroundChains(workspace);

  for (const chain of chains) {
    let block: Blockly.Block | null =
      chain.type === "background_when_run" ? chain.getNextBlock() : chain;

    while (block) {
      if (block.type === "background_wait_ms") {
        await sleep(Math.min(readNumber(block, "TIME"), 3000));
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
