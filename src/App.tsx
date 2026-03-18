import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { createWorkspaceManager } from "./devices/base/workspace/managerWorkspace";
import type { SymbolTableRow } from "./core/blockEngine/semantic/symbolTable";
import { compileArduino } from "./core/codeEngine/arduinoCompiler";
import "./App.css";

function App() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  const [code, setCode] = useState("");
  const [board, setBoard] = useState("esp32");
  const [projectName, setProjectName] = useState("Sin título");
  const [activeTab, setActiveTab] = useState<"blocks" | "code">("blocks");
  const [connectionType] = useState<
    "usb" | "bluetooth" | "wifi"
  >("usb");
  const [isConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"cargar" | "envivo">("envivo");
  const [symbolRows, setSymbolRows] = useState<SymbolTableRow[]>([]);
  const [debugMode, setDebugMode] = useState(false);

  const devices = [
    { id: "esp32", name: "ESP32", img: "/devices/esp32.webp" },
    { id: "uno", name: "Arduino Uno", img: "/devices/arduino_uno.webp" },
    { id: "mega", name: "Arduino Mega", img: "/devices/arduino_mega.webp" },
    { id: "nano", name: "Arduino Nano", img: "/devices/arduino_nano.webp" },
    { id: "codey", name: "Codey", img: "/devices/Codey.webp" },
  ];

  useEffect(() => {
    if (!blocklyDiv.current) return;

    if (workspaceRef.current) {
      workspaceRef.current.dispose();
      workspaceRef.current = null;
    }

    workspaceRef.current = createWorkspaceManager(blocklyDiv.current, board, {
      onSymbolTableChange: setSymbolRows,
    });

    const onChange = () => {
      if (!workspaceRef.current) return;
      const generated = compileArduino(workspaceRef.current, board);
      setCode(generated);
    };

    workspaceRef.current.addChangeListener(onChange);
    setCode(compileArduino(workspaceRef.current, board));

    return () => {
      if (workspaceRef.current) {
        workspaceRef.current.removeChangeListener(onChange);
        workspaceRef.current.dispose();
        workspaceRef.current = null;
      }
      setSymbolRows([]);
    };
  }, [board]);

  useEffect(() => {
    if (!workspaceRef.current) return;
    setCode(compileArduino(workspaceRef.current, board));
  }, [board]);

  const handleRun = () => alert("Ejecutar: Iniciando ejecución del código...");
  const handleStop = () => alert("Detener: Deteniendo la ejecución...");
  const handleToggleDebug = () => setDebugMode((current) => !current);
  const handleUpload = () => {
    const currentDevice = devices.find((d) => d.id === board);
    alert(`Cargar: Subiendo código a ${currentDevice?.name || board}...`);
  };
  const handleSave = () =>
    alert(`Guardar: Guardando proyecto "${projectName}"...`);
  const handleFile = () => alert("Menú Archivo: Nuevo, Abrir, Guardar como...");
  const handleEdit = () =>
    alert("Menú Editar: Deshacer, Rehacer, Copiar, Pegar...");
  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert("Código copiado al portapapeles"))
      .catch(() => alert("Error al copiar el código"));
  };

  const handleDownloadCode = () => {
    const suggestedName = projectName.trim() || "proyecto";
    const requestedName = window.prompt(
      "Nombre del archivo .ino",
      suggestedName
    );

    if (requestedName === null) return;

    const sanitizedName =
      requestedName.trim().replace(/[<>:\"/\\|?*\x00-\x1F]/g, "_") || "proyecto";

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sanitizedName.replace(/\s+/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleModeChange = (mode: "cargar" | "envivo") => {
    setActiveMode(mode);
    alert(`Modo cambiado a: ${mode === "cargar" ? "Cargar" : "En vivo"}`);
  };

  const handleFullscreen = () =>
    alert("Pantalla completa: Expandiendo vista...");
  const handleRotate = () => alert("Rotar: Rotando vista del dispositivo...");

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div
            className="logo"
            onClick={() => window.open("https://1bot.org", "_blank")}
            style={{ cursor: "pointer" }}
          >
            <img src="logo.webp" alt="1bot-logo" />
          </div>

          <nav className="nav-menu">
            |
            <button className="nav-btn" onClick={handleFile}>
              <span className="nav-text">Archivo</span>
            </button>
            <button className="nav-btn" onClick={handleEdit}>
              <span className="nav-text">Editar</span>
            </button>
          </nav>

          <div className="project-name-container">
            <input
              type="text"
              className="project-name-input"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <button className="save-btn" onClick={handleSave}>
            <span className="btn-text">Guardar</span>
          </button>
        </div>

        <div className="header-right">
          <button className="action-btn run-btn" onClick={handleRun}>
            <span className="btn-text">Correr</span>
          </button>
          <button
            className={`action-btn debug-btn ${debugMode ? "active" : ""}`}
            onClick={handleToggleDebug}
          >
            <span className="btn-text">{debugMode ? "Salir debug" : "Debug"}</span>
          </button>
          <button className="action-btn stop-btn" onClick={handleStop}>
            <span className="btn-text">Detener</span>
          </button>
          <button className="action-btn upload-btn" onClick={handleUpload}>
            <span className="btn-text">Cargar</span>
          </button>
        </div>
      </header>

      <div className="main-content">
        <aside className="sidebar-left">
          <div className="device-preview">
            <div className="device-image">
              <div className="robot-avatar">
                <div className="robot-face">
                  <div className="robot-eye left"></div>
                  <div className="robot-eye right"></div>
                </div>
                <div className="robot-antenna"></div>
              </div>
            </div>
          </div>

          <div className="sidebar-controls">
            <button
              className="control-btn"
              title="Pantalla completa"
              onClick={handleFullscreen}
            ></button>
            <button
              className="control-btn"
              title="Rotar"
              onClick={handleRotate}
            ></button>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button className="tab active">Dispositivos</button>
              <button className="tab">Objetos</button>
              <button className="tab">Fondo</button>
            </div>
            <div className="tab-content">
              <div className="device-selector">
                <div
                  className="device-card selected"
                  onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}
                >
                  <span className="device-name">
                    {devices.find((d) => d.id === board)?.name}
                  </span>
                </div>

                {deviceMenuOpen && (
                  <div className="device-menu">
                    {devices.map((device) => (
                      <div
                        key={device.id}
                        className="device-option"
                        onClick={() => {
                          setBoard(device.id);
                          setDeviceMenuOpen(false);
                        }}
                      >
                        <span>{device.name}</span>
                        <img src={device.img} alt="img_boards" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mode-section">
            <span className="mode-label">Modo:</span>
            <div className="mode-toggle">
              <button
                className={`mode-btn ${activeMode === "cargar" ? "active" : ""}`}
                onClick={() => handleModeChange("cargar")}
              >
                Cargar
              </button>
              <button
                className={`mode-btn ${activeMode === "envivo" ? "active" : ""}`}
                onClick={() => handleModeChange("envivo")}
              >
                En vivo
              </button>
            </div>
          </div>
        </aside>

        <main className="workspace-container">
          <div className="workspace-tabs">
            <button
              className={`workspace-tab ${activeTab === "blocks" ? "active" : ""}`}
              onClick={() => setActiveTab("blocks")}
            >
              Bloques
            </button>
            <button
              className={`workspace-tab ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              Código
            </button>

            {activeTab === "code" && (
              <div className="code-actions">
                <button className="code-btn" onClick={handleCopyCode}>
                  Copiar
                </button>
                <button className="code-btn download-btn" onClick={handleDownloadCode}>
                  Descargar .ino
                </button>
              </div>
            )}
          </div>

          <div
            className={`workspace ${activeTab === "blocks" ? "visible" : "hidden"}`}
          >
            <div ref={blocklyDiv} className="blockly-container" />
            {debugMode && <aside className="symbol-table-panel">
              <div className="symbol-table-header">
                <h3>Tabla de simbolos</h3>
                <span>{symbolRows.length} registros</span>
              </div>

              {symbolRows.length === 0 ? (
                <p className="symbol-table-empty">
                  Aun no hay variables registradas en el analisis.
                </p>
              ) : (
                <div className="symbol-table-scroll">
                  <table className="symbol-table">
                    <thead>
                      <tr>
                        <th>Nombre</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Init</th>
                        <th>Uso</th>
                        <th>Scope</th>
                      </tr>
                    </thead>
                    <tbody>
                      {symbolRows.map((row, index) => (
                        <tr key={`${row.name}-${row.scopeLevel}-${index}`}>
                          <td>{row.name}</td>
                          <td>{row.type ?? "null"}</td>
                          <td>{row.value === null ? "null" : String(row.value)}</td>
                          <td>{row.initialized ? "si" : "no"}</td>
                          <td>{row.used ? "si" : "no"}</td>
                          <td>{row.scopeLevel}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </aside>}
          </div>

          <div
            className={`code-panel ${activeTab === "code" ? "visible" : "hidden"}`}
          >
            <pre className="code-content">
              <code>{code}</code>
            </pre>
          </div>
        </main>
      </div>

      <footer className="status-bar">
        <div className="status-left">
          <span
            className={`status-indicator ${isConnected ? "connected" : ""}`}
          ></span>
          <span className="status-text">
            {isConnected
              ? `Conectado a ${board.toUpperCase()} via ${connectionType.toUpperCase()}`
              : "Sin conexión"}
          </span>
        </div>
        <div className="status-right">
          <span>1bot IDE v1.0</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
