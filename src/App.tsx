import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import "./App.css";
import { io } from "socket.io-client";
import * as Blockly from "blockly";
import { EXAMPLES, getExamplePath } from "./app/components/ExamplesPanel";

type Toast = {
  id: number;
  type: "success" | "error" | "info";
  message: string;
};

function sanitizeFilename(value: string) {
  return value.replace(/[<>:"/\\|?*]/g, "_");
}

const BOARD_FQBN: Record<string, string> = {
  esp32: "esp32:esp32:esp32",
  uno: "arduino:avr:uno",
};

const MAX_SERIAL_LOG_LINES = 300;
const TOAST_DURATION_MS = 4200;

function App() {
  const [language, setLanguage] = useState<Language>(
    () => (i18n.language === "en" ? "en" : "es")
  );
  const [board, setBoard] = useState("esp32");
  const [projectName, setProjectName] = useState(() => i18n.t("projectUntitled"));
  const [activeTab, setActiveTab] = useState<"blocks" | "code" | "simulator">("blocks");
  const [connectionType] = useState<"usb" | "bluetooth" | "wifi">("usb");
  const [isConnected, setIsConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [symbolRows, setSymbolRows] = useState<SymbolTableRow[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [, setLanguageVersion] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [ports, setPorts] = useState<SerialPortOption[]>([]);
  const [selectedPort, setSelectedPort] = useState("");
  const [serialOpen, setSerialOpen] = useState(false);
  const [serialLogs, setSerialLogs] = useState<string[]>([]);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [examplesOpen, setExamplesOpen] = useState(false);
  const [hardwareValues, setHardwareValues] = useState<Record<string, string | number | boolean>>({});

  const {
    blocklyDivRef,
    code,
    workspaceVersion,
    getSimulationSnapshot,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
    workspaceRef,
  } = useBlocklyEditor({
    board,
    language,
    onSymbolTableChange: setSymbolRows,
  });

  const t = useCallback(
    (key: string, options?: Record<string, string | number>) => {
      void language;
      return i18n.t(key, options);
    },
    [language]
  );

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

  const dismissToast = useCallback((id: number) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (type: Toast["type"], message: string) => {
      const id = Date.now() + Math.random();
      setToasts((current) => [...current, { id, type, message }].slice(-4));
      window.setTimeout(() => dismissToast(id), TOAST_DURATION_MS);
    },
    [dismissToast]
  );

  const parseHardwareData = useCallback((line: string) => {
    const trimmed = line.trim();
    
    if (trimmed.startsWith("VAR:")) {
      const rest = trimmed.substring(4);
      const eqIndex = rest.indexOf("=");
      if (eqIndex > 0) {
        const name = rest.substring(0, eqIndex).trim();
        const valueStr = rest.substring(eqIndex + 1).trim();
        
        let value: string | number | boolean = valueStr;
        
        if (valueStr === "true" || valueStr === "TRUE") {
          value = true;
        } else if (valueStr === "false" || valueStr === "FALSE") {
          value = false;
        } else if (!Number.isNaN(Number(valueStr))) {
          value = Number(valueStr);
        }
        
        setHardwareValues(prev => ({ ...prev, [name]: value }));
        return true;
      }
    }
    return false;
  }, []);

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("serial-data", (line: string) => {
      setSerialLogs((prev) => [...prev, line].slice(-MAX_SERIAL_LOG_LINES));
      parseHardwareData(line);
    });

    return () => {
      socket.disconnect();
    };
  }, [parseHardwareData]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const fetchPorts = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/arduino/ports");
      const data = await res.json();

      if (data.ok) {
        setPorts(data.ports);
        showToast("success", "Puertos COM actualizados correctamente.");
        return;
      }

      showToast(
        "error",
        data.error ||
          "No se pudieron cargar los puertos COM. Verifica que el servicio local esté ejecutándose."
      );
    } catch (err) {
      showToast(
        "error",
        `No se pudo conectar con el servicio local de Arduino para leer puertos. Detalle: ${
          err instanceof Error ? err.message : "error desconocido"
        }`
      );
    }
  }, [showToast]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchPorts();
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [fetchPorts]);

  const startSerialMonitor = useCallback(async () => {
    if (!selectedPort) {
      showToast("error", "Selecciona un puerto COM antes de abrir el monitor serial.");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/api/arduino/monitor/start", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ port: selectedPort, baud: 115200 }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSerialLogs([]);
      setSerialOpen(true);
      showToast("success", `Monitor serial abierto en ${selectedPort}.`);
    } catch (err) {
      showToast(
        "error",
        `No se pudo abrir el monitor serial en ${selectedPort}. Detalle: ${
          err instanceof Error ? err.message : "error desconocido"
        }`
      );
    }
  }, [selectedPort, showToast]);

  const stopSerialMonitor = useCallback(async () => {
    try {
      const res = await fetch("http://localhost:3000/api/arduino/monitor/stop", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      setSerialOpen(false);
      showToast("success", "Monitor serial cerrado.");
    } catch (err) {
      showToast(
        "error",
        `No se pudo cerrar el monitor serial. Detalle: ${
          err instanceof Error ? err.message : "error desconocido"
        }`
      );
    }
  }, [showToast]);

  useEffect(() => {
    void i18n.changeLanguage(language).then(() => {
      setLanguageVersion((current) => current + 1);
    });
    persistLanguage(language);
  }, [language]);

  const downloadGeneratedCode = useCallback(
    (filename: string) => {
      const blob = new Blob([code], { type: "text/plain" });
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
      showToast(
        "error",
        "No hay código generado para compilar. Agrega bloques antes de correr el programa."
      );
      return;
    }

    const filename = `${sanitizeFilename(projectName)}.ino`;
    setIsUploading(true);

    try {
      const formData = new FormData();
      const fqbn = BOARD_FQBN[board] || "esp32:esp32:esp32";

      formData.append("file", new Blob([code]), filename);
      formData.append("upload", "true");
      formData.append("fqbn", fqbn);

      if (selectedPort) {
        formData.append("port", selectedPort);
      }

      const res = await fetch("http://localhost:3000/api/arduino/compile", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (result.ok) {
        setIsConnected(true);
        showToast("success", result.message || "Programa compilado y cargado correctamente.");
        return;
      }

      showToast(
        "error",
        result.error ||
          "La compilación falló. Revisa la placa seleccionada, el puerto COM y el código generado."
      );
    } catch (err) {
      showToast("error", getArduinoCompileErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  }, [board, code, projectName, selectedPort, showToast]);

  const handleRun = useCallback(() => {
    void compileAndUpload();
  }, [compileAndUpload]);

  const handleCopyCode = useCallback(() => {
    void navigator.clipboard
      .writeText(code)
      .then(() => showToast("success", "Código copiado al portapapeles."))
      .catch((err) =>
        showToast(
          "error",
          `No se pudo copiar el código al portapapeles. Detalle: ${
            err instanceof Error ? err.message : "permiso denegado"
          }`
        )
      );
  }, [code, showToast]);

  const handleDownloadCode = useCallback(() => {
    const filename = `${projectName}.ino`;
    downloadGeneratedCode(filename);
    showToast("success", `Archivo ${filename} descargado.`);
  }, [downloadGeneratedCode, projectName, showToast]);

  const getScopeLabel = useCallback((row: SymbolTableRow) => row.scopeKind, []);
  const handleToggleDebug = useCallback(() => setDebugMode((current) => !current), []);
  const handleToggleDeviceMenu = useCallback(
    () => setDeviceMenuOpen((current) => !current),
    []
  );
  const handleSave = useCallback(() => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      showToast("error", "No hay un proyecto para guardar.");
      return;
    }

    const state = Blockly.serialization.workspaces.save(workspace);
    const projectData = {
      version: "1.0",
      board,
      projectName,
      blocks: state,
    };

    const json = JSON.stringify(projectData, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName.replace(/[^a-z0-9]/gi, "_")}.1bot.json`;
    link.click();
    URL.revokeObjectURL(url);
    showToast("success", `Proyecto guardado como ${link.download}`);
  }, [workspaceRef, board, projectName, showToast]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleShowExamples = useCallback(() => {
    setExamplesOpen(true);
  }, []);

const handleLoadExample = useCallback(async (exampleId: string) => {
    const workspace = workspaceRef.current;
    if (!workspace) {
      showToast("error", "El editor no está listo.");
      return;
    }

    const example = EXAMPLES.find(e => e.id === exampleId);
    if (!example) {
      showToast("error", "Ejemplo no encontrado.");
      return;
    }

    const examplePath = getExamplePath(example);
    
    try {
      const response = await fetch(examplePath);
      if (!response.ok) {
        throw new Error(`No se pudo cargar el ejemplo: ${response.status}`);
      }
      
      const projectData = await response.json();
      console.log("Cargando ejemplo:", exampleId, projectData);
      
      workspace.clear();
      Blockly.serialization.workspaces.load(projectData.blocks, workspace);
      
      const startBlock = workspace.newBlock("program_start") as any;
      startBlock.initSvg();
      startBlock.render();
      startBlock.moveBy(50, 20);
      startBlock.setDeletable(false);
      startBlock.setMovable(false);
      
      if (projectData.projectName) {
        setProjectName(projectData.projectName);
      }
      
      setExamplesOpen(false);
      showToast("success", `Ejemplo "${projectData.projectName}" cargado`);
    } catch (err) {
      console.error("Error cargando ejemplo:", err);
      showToast("error", `Error al cargar ejemplo: ${err instanceof Error ? err.message : "desconocido"}`);
    }
  }, [workspaceRef, showToast]);

  const handleCloseExamples = useCallback(() => {
    setExamplesOpen(false);
  }, []);

  const loadProjectFile = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const projectData = JSON.parse(e.target?.result as string);
        
        if (!projectData.blocks) {
          throw new Error("Archivo de proyecto inválido");
        }

        const workspace = workspaceRef.current;
        if (!workspace) {
          showToast("error", "El editor no está listo para cargar el proyecto.");
          return;
        }

        if (projectData.board && projectData.board !== board) {
          showToast("info", `El proyecto era para ${projectData.board}, pero usarás ${board}.`);
        }

        workspace.clear();
        const parsed = JSON.parse(JSON.stringify(projectData.blocks));
        Blockly.serialization.workspaces.load(parsed, workspace);

        if (projectData.projectName) {
          setProjectName(projectData.projectName);
        }

        showToast("success", `Proyecto "${projectData.projectName || file.name}" cargado correctamente.`);
      } catch (err) {
        showToast("error", `Error al cargar el proyecto: ${err instanceof Error ? err.message : "formato inválido"}`);
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  }, [workspaceRef, board, showToast]);
  const handleEdit = useCallback(() => {}, []);
  const handleFullscreen = useCallback(() => {
    if (!document.fullscreenEnabled) {
      showToast("error", "Tu navegador no permite activar pantalla completa desde esta página.");
      return;
    }

    const fullscreenAction = document.fullscreenElement
      ? document.exitFullscreen()
      : document.documentElement.requestFullscreen();

    void fullscreenAction
      .then(() => {
        const active = Boolean(document.fullscreenElement);
        setIsFullscreen(active);
        showToast(
          "success",
          active ? "Pantalla completa activada." : "Pantalla completa desactivada."
        );
      })
      .catch((err) => {
        showToast(
          "error",
          `No se pudo cambiar el modo de pantalla completa. Detalle: ${
            err instanceof Error ? err.message : "permiso denegado por el navegador"
          }`
        );
      });
  }, [showToast]);
  const handleRotate = useCallback(
    () => showToast("info", "La acción de rotar todavía no está implementada."),
    [showToast]
  );

  return (
    <div className="app-container">
      <AppHeader
        language={language}
        projectName={projectName}
        debugMode={debugMode}
        onProjectNameChange={setProjectName}
        onLanguageChange={setLanguage}
        onRun={handleRun}
        onToggleDebug={handleToggleDebug}
        onExamples={handleShowExamples}
        onSave={handleSave}
        onFile={handleFile}
        onEdit={handleEdit}
        isUploading={isUploading}
        t={t}
      />

      <div className="main-content">
        <AppSidebar
          board={board}
          isFullscreen={isFullscreen}
          deviceMenuOpen={deviceMenuOpen}
          currentDevice={currentDevice}
          devices={DEVICES}
          onBoardChange={setBoard}
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
          getSimulationSnapshot={getSimulationSnapshot}
          onTabChange={setActiveTab}
          onCopyCode={handleCopyCode}
          onDownloadCode={handleDownloadCode}
          getScopeLabel={getScopeLabel}
          t={t}
          hardwareValues={hardwareValues}
        />
      </div>

      <AppStatusBar
        board={board}
        connectionType={connectionType}
        isConnected={isConnected}
        compileTargetLabel={isConnected ? "Arduino conectado" : compileTargetLabel}
        t={t}
      />

      {serialOpen && (
        <div className="serial-monitor">
          <div className="serial-header">
            Serial Monitor
            <button onClick={stopSerialMonitor}>Cerrar</button>
          </div>

          <div className="serial-body">
            {serialLogs.map((line, index) => (
              <div key={index}>{line}</div>
            ))}
          </div>
        </div>
      )}

      <div className="toast-region" aria-live="polite" aria-relevant="additions">
        {toasts.map((toast) => (
          <button
            key={toast.id}
            className={`toast toast-${toast.type}`}
            onClick={() => dismissToast(toast.id)}
          >
            <span className="toast-title">
              {toast.type === "success" ? "Listo" : toast.type === "error" ? "Error" : "Info"}
            </span>
            <span className="toast-message">{toast.message}</span>
          </button>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".json,.1bot.json"
        style={{ display: "none" }}
        onChange={loadProjectFile}
      />

      {examplesOpen && (
        <ExamplesPanel
          board={board}
          onSelectExample={handleLoadExample}
          onClose={handleCloseExamples}
        />
      )}
    </div>
  );
}

export default App;
