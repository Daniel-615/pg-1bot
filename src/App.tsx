import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { SymbolTableRow } from "./core/blockEngine/semantic/base/symbolTable";
import i18n, { persistLanguage, type Language } from "./i18n";
import { DEVICES } from "./app/constants";
import { useBlocklyEditor } from "./app/hooks/useBlocklyEditor";
import { AppHeader } from "./app/components/AppHeader";
import { AppSidebar } from "./app/components/AppSidebar";
import { AppWorkspace } from "./app/components/AppWorkspace";
import { AppStatusBar } from "./app/components/AppStatusBar";
import { ExamplesPanel } from "./app/components/ExamplesPanel";
import {
  getArduinoCompileErrorMessage,
  resolveCompileTarget,
} from "./api/arduino.compile";
import { detectClientPlatform } from "./app/platform";
import type { SerialPortOption } from "./app/types";
import {
  createWokwiProjectFiles,
  emptyWokwiSimulationState,
  getWokwiNewProjectUrl,
  type WokwiProjectFiles,
  type WokwiSimulationState,
} from "./simulator/wokwi";
import "./App.css";
import { io } from "socket.io-client";
import * as Blockly from "blockly";
import { ToastContainer, toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  Logout,
  refreshTokenRequest,
  verifySessionRequest,
  type AuthUser,
} from "./api/auth";
import type {
  Issue
} from "./core/blockEngine/semantic/arduinoSemanticAnalyzer"

function sanitizeFilename(value: string) {
  return value.replace(/[<>:"/\\|?*]/g, "_");
}

const BOARD_FQBN: Record<string, string> = {
  esp32: "esp32:esp32:esp32",
  uno: "arduino:avr:uno",
};

const MAX_SERIAL_LOG_LINES = 300;

type ProjectFileData = {
  version?: string;
  board?: string;
  projectName?: string;
  blocks?: unknown;
};

type EditorMode = "device" | "background";

function getInitialWorkspaceSnapshot() {
  return {
    board: "esp32",
    projectName: i18n.t("projectUntitled"),
    blocks: null,
  };
}

function App() {
  const navigate = useNavigate();
  const [initialWorkspace] = useState(getInitialWorkspaceSnapshot);
  const [language, setLanguage] = useState<Language>(
    () => (i18n.language === "en" ? "en" : "es")
  );

  const [projectLoadVersion, setProjectLoadVersion] = useState(0);
  const [deviceWorkspaceBlocks, setDeviceWorkspaceBlocks] = useState<unknown | null>(
    initialWorkspace.blocks
  );
  const [backgroundWorkspaceBlocks, setBackgroundWorkspaceBlocks] = useState<unknown | null>(null);
  const [editorMode, setEditorMode] = useState<EditorMode>("device");
  const [board, setBoard] = useState(initialWorkspace.board);
  const [projectName, setProjectName] = useState(initialWorkspace.projectName);

  const [activeTab, setActiveTab] = useState<
    "blocks" | "code" | "simulator"
  >("blocks");

  const [connectionType] = useState<"usb" | "bluetooth" | "wifi">("usb");
  const [isConnected, setIsConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [symbolRows, setSymbolRows] = useState<SymbolTableRow[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [, setLanguageVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [wokwiState, setWokwiState] = useState<WokwiSimulationState>(
    emptyWokwiSimulationState
  );

  const [ports, setPorts] = useState<SerialPortOption[]>([]);
  const [selectedPort, setSelectedPort] = useState("");

  const [serialOpen, setSerialOpen] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);


  const {
    blocklyDivRef,
    code,
    workspaceVersion,
    workspace,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
    workspaceRef,
    semanticErrors
  } = useBlocklyEditor({
    board,
    editorMode,
    language,
    workspaceKey: `${editorMode}:${projectLoadVersion}`,
    initialBlocks: editorMode === "background" ? backgroundWorkspaceBlocks : deviceWorkspaceBlocks,
    enabled: !isCheckingSession,
    onSymbolTableChange: setSymbolRows,
    onWorkspaceChange: (blocks) => {
      if (editorMode === "background") {
        setBackgroundWorkspaceBlocks(blocks);
        return;
      }

      setDeviceWorkspaceBlocks(blocks);
    },
  });

  const t = useCallback(
    (key: string, options?: Record<string, string | number>) => {
      void language;
      return i18n.t(key, options);
    },
    [language]
  );

  useEffect(() => {
    let isMounted = true;

    const verifySession = async () => {
      const session = await verifySessionRequest();

      if (session.success) {
        if (isMounted) {
          setAuthUser(session.data);
          setIsCheckingSession(false);
        }

        return;
      }

      const refreshed = await refreshTokenRequest();

      if (refreshed.success) {
        const retrySession = await verifySessionRequest();

        if (retrySession.success) {
          if (isMounted) {
            setAuthUser(retrySession.data);
            setIsCheckingSession(false);
          }

          return;
        }
      }

      if (isMounted) {
        setAuthUser(null);
        setIsCheckingSession(false);
        navigate("/login", { replace: true });
      }
    };

    void verifySession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const clientPlatform = useMemo(() => detectClientPlatform(), []);

  const compileTarget = useMemo(
    () => resolveCompileTarget(clientPlatform),
    [clientPlatform]
  );

  const compileTargetLabel = useMemo(
    () =>
      clientPlatform === "mobile"
        ? t("compileTargetBackend", { apiUrl: compileTarget.apiUrl })
        : t("compileTargetLocal", { apiUrl: compileTarget.apiUrl }),
    [clientPlatform, compileTarget.apiUrl, t]
  );

  const currentDevice = useMemo(
    () => DEVICES.find((device) => device.id === board),
    [board]
  );

  const wokwiPreviewFiles = useMemo<WokwiProjectFiles | null>(() => {
    if (!code.trim()) {
      return null;
    }

    try {
      return createWokwiProjectFiles({ board, code });
    } catch {
      return null;
    }
  }, [board, code]);

  const resetSimulation = useCallback(
    (nextBoard: string) => {
      setWokwiState({
        ...emptyWokwiSimulationState(),
        board: nextBoard,
      });
    },
    []
  );

  const handleProjectNameChange = useCallback(
    (value: string) => {
      setProjectName(value);
    },
    []
  );

  const handleBoardChange = useCallback(
    (value: string) => {
      setBoard(value);
      resetSimulation(value);
    },
    [resetSimulation]
  );

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_ARDUINO_API_URL;
    if (!backendUrl) {
      toast.error(
        "La URL del servicio de compilación no está configurada"
      );
    }
    const socket = io(backendUrl);

    socket.on("serial-data", (line: string) => {
      setSerialLogs((prev) =>
        [...prev, line].slice(-MAX_SERIAL_LOG_LINES)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener(
      "fullscreenchange",
      syncFullscreenState
    );

    return () =>
      document.removeEventListener(
        "fullscreenchange",
        syncFullscreenState
      );
  }, []);

  const fetchPorts = useCallback(async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/arduino/ports"
      );

      const data = await res.json();

      if (data.ok) {
        setPorts(data.ports);
        toast.success("Puertos COM actualizados correctamente.");
        return;
      }

      toast.error(
        data.error ||
        "No se pudieron cargar los puertos COM."
      );
    } catch (err) {
      toast.error(
        `No se pudo conectar con el servicio local. ${err instanceof Error ? err.message : ""
        }`
      );
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPorts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPorts]);

  const startSerialMonitor = useCallback(async () => {
    if (!selectedPort) {
      toast.error(
        "Selecciona un puerto COM antes de abrir el monitor serial."
      );
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:3000/api/arduino/monitor/start",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            port: selectedPort,
            baud: 115200,
          }),
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSerialLogs([]);
      setSerialOpen(true);

      toast.success(
        `Monitor serial abierto en ${selectedPort}.`
      );
    } catch (err) {
      toast.error(
        `No se pudo abrir el monitor serial. ${err instanceof Error ? err.message : ""
        }`
      );
    }
  }, [selectedPort]);

  const stopSerialMonitor = useCallback(async () => {
    try {
      const res = await fetch(
        "http://localhost:3000/api/arduino/monitor/stop",
        {
          method: "POST",
        }
      );

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSerialOpen(false);

      toast.success("Monitor serial cerrado.");
    } catch (err) {
      toast.error(
        `No se pudo cerrar el monitor serial. ${err instanceof Error ? err.message : ""
        }`
      );
    }
  }, []);

  useEffect(() => {
    void i18n.changeLanguage(language).then(() => {
      setLanguageVersion((current) => current + 1);
    });

    persistLanguage(language);
  }, [language]);

  const downloadGeneratedCode = useCallback(
    (filename: string) => {
      const blob = new Blob([code], {
        type: "text/plain",
      });

      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);
    },
    [code]
  );

  const compileAndUpload = useCallback(async () => {

    if (!code.trim()) {
      toast.error(
        "No hay código generado para compilar."
      );
      return;
    }

    const hasErrors = Array.from(
      semanticErrors.values()
    ).some((issues: Issue[]) =>
      issues.some((i) => i.severity === "error")
    )

    if (hasErrors) {
      toast.error(
        "No puedes compilar mientras existan errores semánticos."
      );
      return;
    }

    const filename = `${sanitizeFilename(projectName)}.ino`;

    setIsUploading(true);

    try {
      const formData = new FormData();

      const fqbn =
        BOARD_FQBN[board] || "esp32:esp32:esp32";

      formData.append(
        "file",
        new Blob([code]),
        filename
      );

      formData.append("upload", "true");
      formData.append("fqbn", fqbn);

      if (selectedPort) {
        formData.append("port", selectedPort);
      }

      const res = await fetch(
        "http://localhost:3000/api/arduino/compile",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await res.json();

      if (result.ok) {
        setIsConnected(true);

        toast.success(
          result.message ||
          "Programa compilado y cargado correctamente."
        );

        return;
      }

      toast.error(
        result.error ||
        "La compilación falló."
      );
    } catch (err) {
      toast.error(getArduinoCompileErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }, [board, code, projectName, selectedPort, semanticErrors]);

  const handleRun = useCallback(() => {
    void compileAndUpload();
  }, [compileAndUpload]);

  const handleCopyCode = useCallback(() => {
    void navigator.clipboard
      .writeText(code)
      .then(() =>
        toast.success(
          "Código copiado al portapapeles."
        )
      )
      .catch((err) =>
        toast.error(
          `No se pudo copiar el código. ${err instanceof Error ? err.message : ""
          }`
        )
      );
  }, [code]);

  const handleDownloadCode = useCallback(() => {
    const filename = `${projectName}.ino`;

    downloadGeneratedCode(filename);

    toast.success(`Archivo ${filename} descargado.`);
  }, [downloadGeneratedCode, projectName]);

  const handleCopyDiagramJson = useCallback(() => {
    const files = wokwiPreviewFiles ?? wokwiState.files;

    if (!files) {
      toast.error("No hay diagram.json para copiar todavía.");
      return;
    }

    const diagramJson = JSON.stringify(files.diagram, null, 2);

    void navigator.clipboard
      .writeText(diagramJson)
      .then(() => toast.success("diagram.json copiado al portapapeles."))
      .catch((err) =>
        toast.error(
          `No se pudo copiar diagram.json. ${err instanceof Error ? err.message : ""}`
        )
      );
  }, [wokwiPreviewFiles, wokwiState.files]);

  const handleOpenWokwi = useCallback(() => {
    const url = wokwiState.projectUrl ?? getWokwiNewProjectUrl(board);

    window.open(url, "_blank", "noopener,noreferrer");
  }, [board, wokwiState.projectUrl]);

  const getScopeLabel = useCallback(
    (row: SymbolTableRow) => row.scopeKind,
    []
  );

  const handleToggleDebug = useCallback(
    () => setDebugMode((current) => !current),
    []
  );

  const handleToggleDeviceMenu = useCallback(
    () => setDeviceMenuOpen((current) => !current),
    []
  );

  const handleSave = useCallback(() => {
    const workspace = workspaceRef.current;

    if (!workspace) {
      toast.error("No hay un proyecto para guardar.");
      return;
    }

    const state =
      Blockly.serialization.workspaces.save(workspace);

    const projectData = {
      version: "1.0",
      board,
      projectName,
      blocks: state,
    };

    const json = JSON.stringify(projectData, null, 2);

    const blob = new Blob([json], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = url;

    link.download = `${projectName.replace(
      /[^a-z0-9]/gi,
      "_"
    )}.1bot.json`;

    link.click();

    URL.revokeObjectURL(url);

    toast.success(
      `Proyecto guardado como ${link.download}`
    );
  }, [workspaceRef, board, projectName]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleProjectFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];

      event.target.value = "";

      if (!file) {
        return;
      }

      void file
        .text()
        .then((content) => {
          const project = JSON.parse(content) as ProjectFileData;

          if (!project.blocks || typeof project.blocks !== "object") {
            throw new Error("El archivo no contiene bloques Blockly válidos.");
          }

          const nextBoard = project.board || "esp32";
          const nextProjectName = project.projectName || file.name.replace(/\.1bot\.json$|\.json$/i, "");

          setBoard(nextBoard);
          setProjectName(nextProjectName);
          setDeviceWorkspaceBlocks(project.blocks);
          setEditorMode("device");
          setProjectLoadVersion((current) => current + 1);
          resetSimulation(nextBoard);
          toast.success(`Proyecto ${nextProjectName} cargado.`);
        })
        .catch((error) => {
          toast.error(
            `No se pudo abrir el proyecto. ${error instanceof Error ? error.message : ""}`
          );
        });
    },
    [resetSimulation]
  );

  const handleShowExamples = useCallback(() => {
    setExamplesOpen(true);
  }, []);

  const handleCloseExamples = useCallback(() => {
    setExamplesOpen(false);
  }, []);

  const handleEdit = useCallback(() => { }, []);

  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled) {
      toast.error(
        "Tu navegador no permite activar pantalla completa."
      );

      return;
    }

    const fullscreenAction = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();

    void fullscreenAction
      .then(() => {
        const active = Boolean(
          document.fullscreenElement
        );

        setIsFullscreen(active);

        toast.success(
          active
            ? "Pantalla completa activada."
            : "Pantalla completa desactivada."
        );
      })
      .catch((err) => {
        toast.error(
          `No se pudo cambiar pantalla completa. ${err instanceof Error ? err.message : ""
          }`
        );
      });
  }, []);

  const handleRotate = useCallback(() => {
    toast.info(
      "La acción de rotar todavía no está implementada."
    );
  }, []);

  const handleLogout = useCallback(async () => {
    const response = await Logout();

    if (!response.success) {
      toast.error(response.error);
    } else {
      toast.success("Sesión cerrada");
    }

    setAuthUser(null);
    navigate("/login", { replace: true });
  }, [navigate]);

  if (isCheckingSession) {
    return (
      <div className="app-container">
        <div className="app-loading">Validando sesión...</div>
        <ToastContainer
          position="bottom-right"
          autoClose={4200}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          theme="dark"
        />
      </div>
    );
  }

  return (
    <div className="app-container">
        <AppHeader
          language={language}
          projectName={projectName}
          debugMode={debugMode}
          onProjectNameChange={handleProjectNameChange}
          onLanguageChange={setLanguage}
        onRun={handleRun}
        onToggleDebug={handleToggleDebug}
        onExamples={handleShowExamples}
        onSave={handleSave}
        onFile={handleFile}
        onEdit={handleEdit}
        isUploading={isUploading}
        userName={authUser?.nombre ?? authUser?.email ?? "Usuario"}
        onLogout={handleLogout}
        t={t}
      />

      <div className="main-content">
        <AppSidebar
          board={board}
          isFullscreen={isFullscreen}
          deviceMenuOpen={deviceMenuOpen}
          currentDevice={currentDevice}
          devices={DEVICES}
          onBoardChange={handleBoardChange}
          onToggleDeviceMenu={handleToggleDeviceMenu}
          onFullscreen={handleFullscreen}
          onRotate={handleRotate}
          t={t}
          ports={ports}
          selectedPort={selectedPort}
          setSelectedPort={setSelectedPort}
          fetchPorts={fetchPorts}
          serialOpen={serialOpen}
          startSerialMonitor={startSerialMonitor}
          stopSerialMonitor={stopSerialMonitor}
          workspace={workspace}
          editorMode={editorMode}
          onEditorModeChange={setEditorMode}
        />

        <AppWorkspace
          activeTab={activeTab}
          board={board}
          code={code}
          debugMode={debugMode}
          symbolRows={symbolRows}
          workspaceVersion={workspaceVersion}
          isEditorLoading={isEditorLoading}
          showEditorLoading={showEditorLoading}
          editorLoadError={editorLoadError}
          blocklyDivRef={blocklyDivRef}
          wokwiState={wokwiState}
          wokwiPreviewFiles={wokwiPreviewFiles}
          onTabChange={setActiveTab}
          onCopyCode={handleCopyCode}
          onDownloadCode={handleDownloadCode}
          onCopyDiagramJson={handleCopyDiagramJson}
          onOpenWokwi={handleOpenWokwi}
          getScopeLabel={getScopeLabel}
          t={t}
        />
      </div>

      <AppStatusBar
        board={board}
        connectionType={connectionType}
        isConnected={isConnected}
        compileTargetLabel={
          isConnected
            ? "Arduino conectado"
            : compileTargetLabel
        }
        t={t}
      />

      {serialOpen && (
        <div className="serial-monitor">
          <div className="serial-header">
            Serial Monitor
            <button onClick={stopSerialMonitor}>
              Cerrar
            </button>
          </div>

          <div className="serial-body">
            {serialLogs.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.1bot.json"
        style={{ display: "none" }}
        onChange={handleProjectFileChange}
      />

      {examplesOpen && (
        <ExamplesPanel
          board={board}
          onSelectExample={() => { }}
          onClose={handleCloseExamples}
        />
      )}

      <ToastContainer
        position="bottom-right"
        autoClose={4200}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="dark"
      />
    </div>
  );
}

export default App;
