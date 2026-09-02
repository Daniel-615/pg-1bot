import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent } from "react";
import type { SymbolTableRow } from "./core/blockEngine/semantic/base/symbolTable";
import i18n, { persistLanguage, type Language } from "./i18n";
import { DEVICES } from "./screens/constants";
import { useBlocklyEditor } from "./hooks/useBlocklyEditor";
import { AppHeader } from "./screens/components/AppHeader";
import { AppSidebar } from "../src/screens/components/AppSidebar";
import { AppWorkspace } from "../src/screens/components/AppWorkspace";
import { AppStatusBar } from "../src/screens/components/AppStatusBar";
import { EXAMPLES, ExamplesPanel, getExamplePath } from "../src/screens/components/ExamplesPanel";
import {
  getArduinoCompileErrorMessage,
  compileSketch,
  resolveCompileTarget,
} from "./services/arduino.compile.service";
import { detectClientPlatform } from "./screens/platform";
import type { SerialPortOption } from "./screens/types";
import {
  createWokwiProjectFiles,
  emptyWokwiSimulationState,
  getWokwiNewProjectUrl,
  type WokwiProjectFiles,
  type WokwiSimulationState,
} from "./screens/simulator/wokwi";
import "./App.css";
import { io } from "socket.io-client";
import * as Blockly from "blockly";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import {
  Logout,
  refreshTokenRequest,
  verifySessionRequest,
  type AuthUser,
} from "./services/auth.service";
import { ExtensionFormScreen } from "./screens/extensions/ExtensionFormScreen";
import type {
  Issue
} from "./core/blockEngine/semantic/arduinoSemanticAnalyzer"
import { reportCriticalErrors } from "./services/errors.service";

function sanitizeFilename(value: string) {
  return value.replace(/[<>:"/\\|?*]/g, "_");
}

const MAX_SERIAL_LOG_LINES = 300;

type ProjectFileData = {
  version?: string;
  board?: string;
  projectName?: string;
  blocks?: unknown;
};

type EditorMode = "device" | "background";

function canManageDashboardContent(user: AuthUser | null) {
  const roles = [
    ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
    ...(user?.roles ?? []).map((role) => role.nombre),
  ].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
  if (roles.some((role) => role === "admin" || role === "1botpersonal")) return true;

  return (user?.permisos ?? []).some((permission) =>
    ["leer_extension", "crear_extension", "editar_extension", "leer_bloque", "crear_bloque", "editar_bloque", "leer_placa", "crear_placa", "editar_placa"].includes(permission)
  );
}

function canAccessDashboard(user: AuthUser | null) {
  const roleNames = [
    ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
    ...(user?.roles ?? []).map((role) => role.nombre),
  ];

  return roleNames.some((role) => {
    const normalizedRole = role.trim().toLowerCase().replace(/\s+/g, "");
    return normalizedRole === "admin" || normalizedRole === "1botpersonal";
  });
}

function getInitialWorkspaceSnapshot() {
  return {
    board: "esp32",
    projectName: i18n.t("projectUntitled"),
    blocks: null,
  };
}

function App() {
  const navigate = useNavigate();
  const location = useLocation();
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
  const [previewRotation, setPreviewRotation] = useState(0);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const isExtensionsPage = ["/extensions", "/bloques", "/placas"].includes(location.pathname);
  const canManageExtensions = canManageDashboardContent(authUser);
  const hasDashboardAccess = canAccessDashboard(authUser);


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
      const criticalIssues = Array.from(semanticErrors.values()).flat().filter((issue) => issue.severity === "error");
      const userId = authUser?.id ?? authUser?.userId;
      if (userId) {
        void reportCriticalErrors({
          userId,
          age: authUser?.edad,
          program: projectName,
          issues: criticalIssues,
        });
      }
      toast.error(
        "No puedes compilar mientras existan errores semánticos."
      );
      return;
    }

    const isCodey = board === "codey";
    const filename = `${sanitizeFilename(projectName)}.${isCodey ? "py" : "ino"}`;

    setIsUploading(true);

    try {
      const result = await compileSketch({ code, board, filename, port: selectedPort, target: compileTarget });

      if (result.ok) {
        setIsConnected(true);

        toast.success(
          result.message ||
          "Programa compilado y cargado correctamente."
        );

        return;
      }

      toast.error(
        result.message ||
        "La compilación falló."
      );
    } catch (err) {
      toast.error(getArduinoCompileErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }, [authUser?.edad, authUser?.id, authUser?.userId, board, code, compileTarget, projectName, selectedPort, semanticErrors]);

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
    const filename = `${projectName}.${board === "codey" ? "py" : "ino"}`;

    downloadGeneratedCode(filename);

    toast.success(`Archivo ${filename} descargado.`);
  }, [board, downloadGeneratedCode, projectName]);

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

  const handleSelectExample = useCallback(
    (exampleId: string) => {
      const example = EXAMPLES.find((item) => item.id === exampleId);

      if (!example) {
        toast.error("No se encontró el ejemplo seleccionado.");
        return;
      }

      void fetch(getExamplePath(example))
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          return response.json() as Promise<ProjectFileData>;
        })
        .then((project) => {
          if (!project.blocks || typeof project.blocks !== "object") {
            throw new Error("El ejemplo no contiene bloques Blockly válidos.");
          }

          const nextBoard = project.board || example.boards[0] || "esp32";
          const nextProjectName = project.projectName || example.filename.replace(/\.json$/i, "");

          setBoard(nextBoard);
          setProjectName(nextProjectName);
          setDeviceWorkspaceBlocks(project.blocks);
          setEditorMode("device");
          setActiveTab("blocks");
          setProjectLoadVersion((current) => current + 1);
          resetSimulation(nextBoard);
          setExamplesOpen(false);
          toast.success(`Ejemplo ${nextProjectName} cargado.`);
        })
        .catch((error) => {
          toast.error(
            `No se pudo cargar el ejemplo. ${error instanceof Error ? error.message : ""}`
          );
        });
    },
    [resetSimulation]
  );

  const handleEdit = useCallback(() => { }, []);

  const handleDashboard = useCallback(() => {
    navigate("/dashboard");
  }, [navigate])
  const handleBackToEditor = useCallback(() => {
    setProjectLoadVersion((current) => current + 1);
    navigate("/");
  }, [navigate]);

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
    setPreviewRotation((current) => (current + 90) % 360);
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
        onDashboard={handleDashboard}
        isUploading={isUploading}
        userName={authUser?.nombre ?? authUser?.email ?? "Usuario"}
        onLogout={handleLogout}
        canAccessDashboard={hasDashboardAccess}
        t={t}
      />

      {isExtensionsPage ? (
        <ExtensionFormScreen
          user={authUser}
          isAdmin={canManageExtensions}
          onBack={handleBackToEditor}
          initialPanel={location.pathname === "/bloques" ? "blocks" : location.pathname === "/placas" ? "plates" : "extensions"}
        />
      ) : (
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
            previewRotation={previewRotation}
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
      )}

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
          onSelectExample={handleSelectExample}
          onClose={handleCloseExamples}
        />
      )}

    </div>
  );
}

export default App;
