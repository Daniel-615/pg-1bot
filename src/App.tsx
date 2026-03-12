import { useEffect, useRef, useState } from "react";
import * as Blockly from "blockly";
import { createWorkspace } from "./core/blockEngine/workspaceManager";
import { compileArduino } from "./core/codeEngine/arduinoCompiler";
import "./App.css";

function App() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);

  const [code, setCode] = useState("");
  const [board, setBoard] = useState("esp32");
  const [projectName, setProjectName] = useState("Sin título");
  const [activeTab, setActiveTab] = useState<"blocks" | "code">("blocks");
  const [connectionType, setConnectionType] = useState<"usb" | "bluetooth" | "wifi">("usb");
  const [isConnected, setIsConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"cargar" | "envivo">("envivo");

  const devices = [
    { id: "esp32", name: "ESP32", img: "/devices/esp32.webp" },
    { id: "uno", name: "Arduino Uno", img: "/devices/arduino_uno.webp" },
    { id: "mega", name: "Arduino Mega", img: "/devices/arduino_mega.webp" },
    { id: "nano", name: "Arduino Nano", img: "/devices/arduino_nano.webp" },
    { id: "codey", name: "Codey", img: "/devices/Codey.webp" }
  ];

  useEffect(() => {
    if (!blocklyDiv.current) return;

    workspaceRef.current = createWorkspace(blocklyDiv.current);

    workspaceRef.current.addChangeListener(() => {
      if (!workspaceRef.current) return;
      const generated = compileArduino(workspaceRef.current, board);
      setCode(generated);
    });

    return () => {
      workspaceRef.current?.dispose();
    };
  }, []);

  useEffect(() => {
    if (!workspaceRef.current) return;
    const generated = compileArduino(workspaceRef.current, board);
    setCode(generated);
  }, [board]);

  // Handlers para botones
  const handleRun = () => {
    alert("Ejecutar: Iniciando ejecución del código...");
  };

  const handleStop = () => {
    alert("Detener: Deteniendo la ejecución...");
  };

  const handleUpload = () => {
    const currentDevice = devices.find(d => d.id === board);
    alert(`Cargar: Subiendo código a ${currentDevice?.name || board}...`);
  };

  const handleSave = () => {
    alert(`Guardar: Guardando proyecto "${projectName}"...`);
  };

  const handleFile = () => {
    alert("Menú Archivo: Nuevo, Abrir, Guardar como...");
  };

  const handleEdit = () => {
    alert("Menú Editar: Deshacer, Rehacer, Copiar, Pegar...");
  };

  const handleZoomIn = () => {
    alert("Zoom +: Acercando workspace...");
  };

  const handleZoomOut = () => {
    alert("Zoom -: Alejando workspace...");
  };

  const handleCenter = () => {
    alert("Centrar: Centrando bloques en el workspace...");
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code).then(() => {
      alert("Código copiado al portapapeles");
    }).catch(() => {
      alert("Error al copiar el código");
    });
  };

  const handleDownloadCode = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${projectName.replace(/\s+/g, "_")}.ino`;
    a.click();
    URL.revokeObjectURL(url);
    alert(`Descargando: ${projectName}.ino`);
  };

  const handleModeChange = (mode: "cargar" | "envivo") => {
    setActiveMode(mode);
    alert(`Modo cambiado a: ${mode === "cargar" ? "Cargar" : "En vivo"}`);
  };

  const handleFullscreen = () => {
    alert("Pantalla completa: Expandiendo vista...");
  };

  const handleRotate = () => {
    alert("Rotar: Rotando vista del dispositivo...");
  };

  return (
    <div className="app-container">
      <header className="header">
        <div className="header-left">
          <div className="logo">
            <img src="logo.webp" alt="1bot-logo" />
          </div>

          <nav className="nav-menu">
            <button className="nav-btn" onClick={handleFile}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
              </svg>
              <span className="nav-text">Archivo</span>
            </button>
            <button className="nav-btn" onClick={handleEdit}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
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
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            <span className="btn-text">Guardar</span>
          </button>
        </div>

        <div className="header-right">
          <button className="action-btn run-btn" onClick={handleRun}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3" />
            </svg>
            <span className="btn-text">Ejecutar</span>
          </button>
          <button className="action-btn stop-btn" onClick={handleStop}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <rect x="4" y="4" width="16" height="16" rx="2" />
            </svg>
            <span className="btn-text">Detener</span>
          </button>
          <button className="action-btn upload-btn" onClick={handleUpload}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
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
            <button className="control-btn" title="Pantalla completa" onClick={handleFullscreen}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>
            <button className="control-btn" title="Rotar" onClick={handleRotate}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 4v6h-6" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
            </button>
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
                  <div className="device-icon">
                    <img
                      src={devices.find(d => d.id === board)?.img}
                      alt={board}
                    />
                  </div>
                  <span className="device-name">
                    {devices.find(d => d.id === board)?.name}
                  </span>
                </div>

                {deviceMenuOpen && (
                  <div className="device-menu">
                    {devices.map(device => (
                      <div
                        key={device.id}
                        className="device-option"
                        onClick={() => {
                          setBoard(device.id);
                          setDeviceMenuOpen(false);
                        }}
                      >
                        <img src={device.img} alt={device.name} />
                        <span>{device.name}</span>
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
              className={`workspace-tab ${activeTab === 'blocks' ? 'active' : ''}`}
              onClick={() => setActiveTab('blocks')}
            >
              Bloques
            </button>
            <button
              className={`workspace-tab ${activeTab === 'code' ? 'active' : ''}`}
              onClick={() => setActiveTab('code')}
            >
              Código
            </button>
          </div>

          <div className={`workspace ${activeTab === 'blocks' ? 'visible' : 'hidden'}`}>
            <div ref={blocklyDiv} className="blockly-container" />

            <div className="workspace-controls">
              <button className="ws-control-btn" title="Acercar" onClick={handleZoomIn}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M11 8v6M8 11h6" />
                </svg>
              </button>
              <button className="ws-control-btn" title="Alejar" onClick={handleZoomOut}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                  <path d="M8 11h6" />
                </svg>
              </button>
              <button className="ws-control-btn" title="Centrar" onClick={handleCenter}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
                </svg>
              </button>
            </div>

            <div className="watermark">1bot</div>
          </div>

          <div className={`code-panel ${activeTab === 'code' ? 'visible' : 'hidden'}`}>
            <div className="code-header">
              <span className="code-filename">main.ino</span>
              <div className="code-actions">
                <button className="code-action-btn" title="Copiar" onClick={handleCopyCode}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                </button>
                <button className="code-action-btn" title="Descargar" onClick={handleDownloadCode}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="7 10 12 15 17 10" />
                    <line x1="12" y1="15" x2="12" y2="3" />
                  </svg>
                </button>
              </div>
            </div>
            <pre className="code-content">
              <code>{code}</code>
            </pre>
            <div className="line-numbers">
              {code.split('\n').map((_, i) => (
                <span key={i}>{i + 1}</span>
              ))}
            </div>
          </div>
        </main>
      </div>

      <footer className="status-bar">
        <div className="status-left">
          <span className={`status-indicator ${isConnected ? 'connected' : ''}`}></span>
          <span className="status-text">
            {isConnected ? `Conectado a ${board.toUpperCase()} via ${connectionType.toUpperCase()}` : 'Sin conexión'}
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