import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import i18n, { type Language } from "../../i18n";
import type { SymbolTableRow } from "../../core/blockEngine/semantic/base/symbolTable";
import type { EditorRuntime} from "../types";
import type { Issue } from "../../core/blockEngine/semantic/arduinoSemanticAnalyzer";
type UseBlocklyEditorOptions = {
  board: string;
  language: Language;
  workspaceKey: string;
  initialBlocks: unknown | null;
  onSymbolTableChange: (rows: SymbolTableRow[]) => void;
  onWorkspaceChange?: (blocks: unknown) => void;
};



export function useBlocklyEditor({
  board,
  language,
  workspaceKey,
  initialBlocks,
  onSymbolTableChange,
  onWorkspaceChange,
}: UseBlocklyEditorOptions) {
  /*
    The core of the software, it has the logic to show TOAST errors, to renderize arduino uno, nano, esp32, codey, etc.
    It also has interaction with Blockly technology
  */
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const runtimeRef = useRef<EditorRuntime | null>(null);
  const initialBlocksRef = useRef(initialBlocks);
  const lastCodeRef = useRef("");
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  const [code, setCode] = useState("");
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showEditorLoading, setShowEditorLoading] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState("");
  const [semanticErrors, setSemanticErrors] = useState<
    Map<string, Issue[]>
  >(new Map());

  initialBlocksRef.current = initialBlocks;
  onWorkspaceChangeRef.current = onWorkspaceChange;

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

        const notifyWorkspaceChange = () => {
          if (!localWorkspace) {
            return;
          }

          onWorkspaceChangeRef.current?.(
            Blockly.serialization.workspaces.save(localWorkspace)
          );
        };

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
          notifyWorkspaceChange();

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
          onSemanticErrorsChange: setSemanticErrors
        });

        if (initialBlocksRef.current) {
          Blockly.serialization.workspaces.load(
            initialBlocksRef.current as Parameters<typeof Blockly.serialization.workspaces.load>[0],
            localWorkspace
          );
        }

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
      } catch (error) {
        console.error("Failed to load Blockly editor", error);
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
  }, [board, language, onSymbolTableChange, workspaceKey]);

  return {
    blocklyDivRef,
    code,
    workspaceVersion,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
    workspaceRef,
    semanticErrors,
  };
}
