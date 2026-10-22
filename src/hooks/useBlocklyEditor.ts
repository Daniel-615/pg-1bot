import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import i18n, { type Language } from "../i18n";
import type { SymbolTableRow } from "../core/blockEngine/semantic/base/symbolTable";
import type { EditorRuntime} from "../screens/types";
import type { Issue } from "../core/blockEngine/semantic/arduinoSemanticAnalyzer";
type UseBlocklyEditorOptions = {
  board: string;
  editorMode: "device" | "background";
  language: Language;
  workspaceKey: string;
  initialBlocks: unknown | null;
  enabled?: boolean;
  onSymbolTableChange: (rows: SymbolTableRow[]) => void;
  onWorkspaceChange?: (blocks: unknown) => void;
  installedExtensionIds?: string[];
  animateInitialBlocks?: boolean;
};



export function useBlocklyEditor({
  board,
  editorMode,
  language,
  workspaceKey,
  initialBlocks,
  enabled = true,
  onSymbolTableChange,
  onWorkspaceChange,
  installedExtensionIds = [],
  animateInitialBlocks = false,
}: UseBlocklyEditorOptions) {
  /*
    The core of the software, it has the logic to show TOAST errors, to renderize arduino uno, nano, esp32, codey, etc.
    It also has interaction with Blockly technology
  */
  const blocklyDivRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const runtimeRef = useRef<EditorRuntime | null>(null);
  const initialBlocksRef = useRef(initialBlocks);
  const animateInitialBlocksRef = useRef(animateInitialBlocks);
  const lastCodeRef = useRef("");
  const onWorkspaceChangeRef = useRef(onWorkspaceChange);
  const [code, setCode] = useState("");
  const [workspaceVersion, setWorkspaceVersion] = useState(0);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showEditorLoading, setShowEditorLoading] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState("");
  const [workspace, setWorkspace] = useState<Blockly.Workspace | null>(null);
  const [semanticErrors, setSemanticErrors] = useState<
    Map<string, Issue[]>
  >(new Map());

  useEffect(() => {
    initialBlocksRef.current = initialBlocks;
    animateInitialBlocksRef.current = animateInitialBlocks;
    onWorkspaceChangeRef.current = onWorkspaceChange;
  }, [animateInitialBlocks, initialBlocks, onWorkspaceChange]);

  useEffect(() => {
    if (!enabled || !blocklyDivRef.current) return;

    let isCancelled = false;
    let compileTimeout: ReturnType<typeof setTimeout> | null = null;
    let loadingTimeout: ReturnType<typeof setTimeout> | null = null;
    const animationTimeouts: ReturnType<typeof setTimeout>[] = [];
    let compileRequestId = 0;
    let localWorkspace: Blockly.Workspace | null = null;
    const shouldAnimateInitialBlocks = animateInitialBlocksRef.current;

    const cleanupWorkspace = () => {
      if (compileTimeout) {
        clearTimeout(compileTimeout);
        compileTimeout = null;
      }

      if (loadingTimeout) {
        clearTimeout(loadingTimeout);
        loadingTimeout = null;
      }

      animationTimeouts.forEach((timeout) => clearTimeout(timeout));

      if (localWorkspace) {
        localWorkspace.dispose();
        localWorkspace = null;
      }

      if (workspaceRef.current) {
        workspaceRef.current = null;
      }

      setWorkspace(null);
    };

    const loadEditorRuntime = async () => {
      if (runtimeRef.current) {
        return runtimeRef.current;
      }

      const [{ applyBlocklyLocale }, { compileArduino }, { createWorkspaceManager }] =
        await Promise.all([
          import("../blockly/messages"),
          import("../core/codeEngine/arduinoCompiler"),
          import("../devices/base/workspace/managerWorkspace"),
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
        if (!isCancelled) setShowEditorLoading(true);
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
          editorMode,
          installedExtensionIds,
          onSymbolTableChange,
          onSemanticErrorsChange: setSemanticErrors
        });

        if (initialBlocksRef.current) {
          Blockly.serialization.workspaces.load(
            initialBlocksRef.current as Parameters<typeof Blockly.serialization.workspaces.load>[0],
            localWorkspace
          );

          if (shouldAnimateInitialBlocks) {
            localWorkspace.getAllBlocks(false).forEach((block, index) => {
              const blockSvg = block as Blockly.BlockSvg;
              blockSvg.getSvgRoot().classList.add("blockly-example-entering");
              blockSvg.getSvgRoot().style.animationDelay = `${index * 65}ms`;

              const animationTimeout = window.setTimeout(() => {
                blockSvg.getSvgRoot().classList.remove("blockly-example-entering");
                blockSvg.getSvgRoot().style.animationDelay = "";
              }, 750 + index * 65);
              animationTimeouts.push(animationTimeout);
            });
          }
        }

        if (isCancelled) {
          cleanupWorkspace();
          return;
        }

        workspaceRef.current = localWorkspace;
        setWorkspace(localWorkspace);
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
  }, [board, editorMode, enabled, installedExtensionIds, language, onSymbolTableChange, workspaceKey]);

  return {
    blocklyDivRef,
    code,
    workspaceVersion,
    workspace,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
    workspaceRef,
    semanticErrors,
  };
}
