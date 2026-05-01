import { useCallback, useEffect, useMemo, useState } from "react";
import type { SymbolTableRow } from "./core/blockEngine/semantic/base/symbolTable";
import i18n, { persistLanguage, type Language } from "./i18n";
import { DEVICES } from "./app/constants";
import { useBlocklyEditor } from "./app/hooks/useBlocklyEditor";
import { AppHeader } from "./app/components/AppHeader";
import { AppSidebar } from "./app/components/AppSidebar";
import { AppWorkspace } from "./app/components/AppWorkspace";
import { AppStatusBar } from "./app/components/AppStatusBar";
import {
  getArduinoCompileErrorMessage,
  resolveCompileTarget,
} from "./api/arduino.compile";
import { detectClientPlatform } from "./app/platform";
import type { SerialPortOption } from "./app/types";
import "./App.css";
import { io } from "socket.io-client";

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

  const {
    blocklyDivRef,
    code,
    workspaceVersion,
    getSimulationSnapshot,
    isEditorLoading,
    showEditorLoading,
    editorLoadError,
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

  useEffect(() => {
    const socket = io("http://localhost:3000");

    socket.on("serial-data", (line) => {
      setSerialLogs((prev) => [...prev, line].slice(-MAX_SERIAL_LOG_LINES));
    });

    return () => {
      socket.disconnect();
    };
  }, []);

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
  const handleSave = useCallback(
    () => showToast("info", "La acción Guardar todavía no está implementada."),
    [showToast]
  );
  const handleFile = useCallback(() => {}, []);
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
    </div>
  );
}

export default App;
