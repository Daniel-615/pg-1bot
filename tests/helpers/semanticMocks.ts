type MockVariableModel = {
  getName: () => string;
};

export type MockBlock = {
  id: string;
  type: string;
  workspace?: MockWorkspace;
  inputList: Array<{
    connection?: {
      targetBlock: () => MockBlock | null;
    };
  }>;
  outputConnection?: {
    targetConnection: object | null;
  };
  warningText: string | null;
  warningHistory: Array<string | null>;
  selected: boolean;
  getFieldValue: (name: string) => string;
  getInputTargetBlock: (name: string) => MockBlock | null;
  getNextBlock: () => MockBlock | null;
  setWarningText: (text: string | null) => void;
  select: () => void;
};

export type MockWorkspace = {
  blocks: MockBlock[];
  variableNamesById: Record<string, string>;
  getAllBlocks: (_ordered: boolean) => MockBlock[];
  getTopBlocks: (_ordered: boolean) => MockBlock[];
  getBlockById: (id: string) => MockBlock | null;
  getVariableById: (id: string) => MockVariableModel | null;
};

type CreateBlockOptions = {
  id?: string;
  type: string;
  fields?: Record<string, string>;
  inputs?: Record<string, MockBlock | null>;
  next?: MockBlock | null;
  outputConnected?: boolean;
};

export function createBlock(options: CreateBlockOptions): MockBlock {
  const {
    id = `${options.type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    fields = {},
    inputs = {},
    next = null,
    outputConnected,
  } = options;

  const block: MockBlock = {
    id,
    type,
    warningText: null,
    warningHistory: [],
    selected: false,
    getFieldValue: (name: string) => fields[name] ?? "",
    getInputTargetBlock: (name: string) => inputs[name] ?? null,
    getNextBlock: () => next,
    setWarningText: (text: string | null) => {
      block.warningText = text;
      block.warningHistory.push(text);
    },
    select: () => {
      block.selected = true;
    },
    inputList: Object.values(inputs).map(child => ({
      connection: child
        ? {
            targetBlock: () => child,
          }
        : undefined,
    })),
  };

  if (outputConnected !== undefined) {
    block.outputConnection = {
      targetConnection: outputConnected ? {} : null,
    };
  }

  return block;
}

export function createWorkspace(
  topBlocks: MockBlock[],
  variableNamesById: Record<string, string> = {}
): MockWorkspace {
  const visited = new Set<MockBlock>();
  const blocks: MockBlock[] = [];

  const collect = (block: MockBlock | null) => {
    if (!block || visited.has(block)) return;
    visited.add(block);
    blocks.push(block);
    Object.keys(block.inputList).forEach(() => undefined);
    const inputNames = new Set<string>();
    const probeNames = ["VALUE", "A", "B", "CONDITION", "IF_BODY", "ELSE_BODY", "BODY", "FROM", "TO", "BOOL", "BOOLEAN"];
    probeNames.forEach(name => {
      const child = block.getInputTargetBlock(name);
      if (child) {
        inputNames.add(name);
        collect(child);
      }
    });
    const next = block.getNextBlock();
    if (next) collect(next);
  };

  topBlocks.forEach(collect);

  const workspace: MockWorkspace = {
    blocks,
    variableNamesById,
    getAllBlocks: () => blocks,
    getTopBlocks: () => topBlocks,
    getBlockById: (id: string) => blocks.find(block => block.id === id) ?? null,
    getVariableById: (id: string) => {
      const name = variableNamesById[id];
      return name ? { getName: () => name } : null;
    },
  };

  blocks.forEach(block => {
    block.workspace = workspace;
  });

  return workspace;
}
