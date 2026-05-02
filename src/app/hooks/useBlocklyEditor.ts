import { useCallback, useEffect, useRef, useState } from "react";
import type * as Blockly from "blockly";
import i18n, { type Language } from "../../i18n";
import type { SymbolTableRow } from "../../core/blockEngine/semantic/base/symbolTable";
import type { EditorRuntime, SimulationBlock } from "../types";

type UseBlocklyEditorOptions = {
  board: string;
  language: Language;
  onSymbolTableChange: (rows: SymbolTableRow[]) => void;
};

type BlocklyFieldLike = {
  name?: string;
  getValue: () => string;
};

function toSimulationBlock(block: Blockly.Block | null): SimulationBlock | null {
  if (!block) {
    return null;
  }

  const fields: Record<string, string> = {};

  for (const input of block.inputList) {
    for (const field of input.fieldRow as BlocklyFieldLike[]) {
      if (field.name) {
        fields[field.name] = String(field.getValue());
      }
    }
  }

  const inputs: Record<string, SimulationBlock | null> = {};

  for (const input of block.inputList) {
    if (input.name) {
      inputs[input.name] = toSimulationBlock(input.connection?.targetBlock() ?? null);
    }
  }

  return {
    id: block.id,
    type: block.type,
    fields,
    inputs,
    next: toSimulationBlock(block.getNextBlock()),
  };
}

export function useBlocklyEditor({
  board,
  language,
  onSymbolTableChange,
}: UseBlocklyEditorOptions) {
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const runtimeRef = useRef<EditorRuntime | null>(null);
  const lastCodeRef = useRef("");
  const [code, setCode] = useState("");
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showEditorLoading, setShowEditorLoading] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState("");

  useEffect(() => {
    if (!blocklyDivRef.current) return;

    let isCancelled = false;
    let compileTimeout: ReturnType<typeof setTimeout> | null = null;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    let compileRequestId = 0;
    let localWorkspace: Blockly.Workspace | null = null;

    const cleanupWorkspace = () => {
      if (compileTimeout) {
        clearTimeout(compileTimeout);
        compileTimeout = null;
      }

      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }

      if (localWorkspace) {
        localWorkspace.dispose();
        localWorkspace = null;
      }

      if (workspaceRef.current) {
        workspaceRef.current = null;
      }
    };

    const loadEditorRuntime = async () => {
      if (runtimeRef.current) {
        return runtimeRef.current;
      }

      const [{ applyBlocklyLocale }, { compileArduino }, { createWorkspaceManager }] =
        await Promise.all([
          import("../../blockly/messages"),
          import("../../core/codeEngine/arduinoCompiler"),
          import("../../devices/base/workspace/managerWorkspace"),
        ]);

      runtimeRef.current = {
        applyBlocklyLocale,
        compileArduino,
        createWorkspaceManager,
      };

      return runtimeRef.current;
    };

    const initializeEditor = async () => {
      setIsEditorLoading(true);
      setShowEditorLoading(false);
      setEditorLoadError("");

      loadingTimeout = setTimeout(() => {
        if (!isCancelled) {
          setShowEditorLoading(true);
        }
      }, 180);

      if (workspaceRef.current) {
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }

      try {
        const runtime = await loadEditorRuntime();

        if (isCancelled || !blocklyDivRef.current) {
          return;
        }

        runtime.applyBlocklyLocale(language);

        const scheduleCompile = (event?: Blockly.Events.Abstract) => {
          if (event?.isUiEvent) {
            return;
          }

          if (!localWorkspace) {
            return;
          }

          compileRequestId += 1;
          const requestId = compileRequestId;

          if (compileTimeout) {
            clearTimeout(compileTimeout);
          }

          setWorkspaceVersion((current) => current + 1);

          compileTimeout = setTimeout(async () => {
            if (!localWorkspace || isCancelled) {
              return;
            }

            const result = await runtime.compileArduino(localWorkspace, board);

            if (
              !isCancelled &&
              workspaceRef.current === localWorkspace &&
              requestId === compileRequestId
            ) {
              if (result.success && result.code) {
                if (result.code !== lastCodeRef.current) {
                  lastCodeRef.current = result.code;
                  setCode(result.code);
                }
              } else {
                setCode("");
              }
            }
          }, 180);
        };

        localWorkspace = await runtime.createWorkspaceManager(blocklyDivRef.current, board, {
          onSymbolTableChange,
        });

        if (isCancelled) {
          cleanupWorkspace();
          return;
        }

        workspaceRef.current = localWorkspace;
        localWorkspace.addChangeListener(scheduleCompile);
        scheduleCompile();

        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }

        setIsEditorLoading(false);
        setShowEditorLoading(false);
      } catch {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }

        if (!isCancelled) {
          setEditorLoadError(i18n.t("editorLoadingError"));
          setIsEditorLoading(false);
          setShowEditorLoading(false);
        }
      }
    };

    void initializeEditor();

    return () => {
      isCancelled = true;
      cleanupWorkspace();
      onSymbolTableChange([]);
      setIsEditorLoading(false);
      setShowEditorLoading(false);
    };
  }, [board, language, onSymbolTableChange]);

  const getSimulationSnapshot = useCallback(() => {
    const workspace = workspaceRef.current;

    if (!workspace) {
      return [];
    }

    return workspace
      .getTopBlocks(true)
      .map((block) => toSimulationBlock(block))
      .filter((block): block is SimulationBlock => Boolean(block));
  }, []);

  return {
    blocklyDivRef,
    code,
    workspaceVersion,
    getSimulationSnapshot,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
    workspaceRef,
  };
}
