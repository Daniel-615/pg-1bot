import { useEffect, useRef, useState } from "react";
import type * as Blockly from "blockly";
import type { SymbolTableRow } from "./core/blockEngine/semantic/symbolTable";
import i18n, { persistLanguage, type Language } from "./i18n";
import "./App.css";

type EditorRuntime = {
  applyBlocklyLocale: (language?: Language) => void;
  compileArduino: (
    workspace: Blockly.Workspace,
    boardType: string
  ) => Promise<string>;
  createWorkspaceManager: (
    container: HTMLDivElement,
    board: string,
    options?: { onSymbolTableChange?: (rows: SymbolTableRow[]) => void }
  ) => Promise<Blockly.Workspace>;
};

function App() {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.Workspace | null>(null);
  const runtimeRef = useRef<EditorRuntime | null>(null);
  const [language, setLanguage] = useState<Language>(
    () => (i18n.language === "en" ? "en" : "es")
  );
  const [code, setCode] = useState("");
  const [board, setBoard] = useState("esp32");
  const [projectName, setProjectName] = useState(() => i18n.t("projectUntitled"));
  const [activeTab, setActiveTab] = useState<"blocks" | "code">("blocks");
  const [connectionType] = useState<"usb" | "bluetooth" | "wifi">("usb");
  const [isConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"cargar" | "envivo">("envivo");
  const [symbolRows, setSymbolRows] = useState<SymbolTableRow[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [isEditorLoading, setIsEditorLoading] = useState(true);
  const [showEditorLoading, setShowEditorLoading] = useState(false);
  const [editorLoadError, setEditorLoadError] = useState("");
  const [, setLanguageVersion] = useState(0);

  const t = (key: string, options?: Record<string, string | number>) =>
    i18n.t(key, options);

  const devices = [
    { id: "esp32", name: "ESP32", img: "/devices/esp32.webp" },
    { id: "uno", name: "Arduino Uno", img: "/devices/arduino_uno.webp" },
    { id: "mega", name: "Arduino Mega", img: "/devices/arduino_mega.webp" },
    { id: "nano", name: "Arduino Nano", img: "/devices/arduino_nano.webp" },
    { id: "codey", name: "Codey", img: "/devices/Codey.webp" },
  ];

  const loadEditorRuntime = async () => {
    if (runtimeRef.current) {
      return runtimeRef.current;
    }

    const [{ applyBlocklyLocale }, { compileArduino }, { createWorkspaceManager }] =
      await Promise.all([
        import("./blockly/messages"),
        import("./core/codeEngine/arduinoCompiler"),
        import("./devices/base/workspace/managerWorkspace"),
      ]);

    runtimeRef.current = {
      applyBlocklyLocale,
      compileArduino,
      createWorkspaceManager,
    };

    return runtimeRef.current;
  };

  useEffect(() => {
    void i18n.changeLanguage(language).then(() => {
      setLanguageVersion((current) => current + 1);
    });
    persistLanguage(language);
  }, [language]);

  useEffect(() => {
    const syncLanguage = (nextLanguage: string) => {
      setLanguage(nextLanguage === "en" ? "en" : "es");
      setLanguageVersion((current) => current + 1);
    };

    i18n.on("languageChanged", syncLanguage);

    return () => {
      i18n.off("languageChanged", syncLanguage);
    };
  }, []);

  useEffect(() => {
    const defaultNames = new Set(["Sin titulo", "Untitled"]);

    if (defaultNames.has(projectName)) {
      setProjectName(t("projectUntitled"));
    }
  }, [language, projectName]);

  useEffect(() => {
    if (!blocklyDiv.current) return;

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

        if (isCancelled || !blocklyDiv.current) {
          return;
        }

        runtime.applyBlocklyLocale(language);

        const scheduleCompile = () => {
          if (!localWorkspace) {
            return;
          }

          compileRequestId += 1;
          const requestId = compileRequestId;

          if (compileTimeout) {
            clearTimeout(compileTimeout);
          }

          compileTimeout = setTimeout(async () => {
            if (!localWorkspace || isCancelled) {
              return;
            }

            const generated = await runtime.compileArduino(localWorkspace, board);

            if (
              !isCancelled &&
              workspaceRef.current === localWorkspace &&
              requestId === compileRequestId
            ) {
              setCode(generated);
            }
          }, 180);
        };

        localWorkspace = await runtime.createWorkspaceManager(blocklyDiv.current, board, {
          onSymbolTableChange: setSymbolRows,
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
      } catch (error) {
        if (loadingTimeout) {
          clearTimeout(loadingTimeout);
          loadingTimeout = null;
        }
        console.error("Error loading editor", error);
        if (!isCancelled) {
          setEditorLoadError(t("editorLoadingError"));
          setIsEditorLoading(false);
          setShowEditorLoading(false);
        }
      }
    };

    void initializeEditor();

    return () => {
      isCancelled = true;
      cleanupWorkspace();
      setSymbolRows([]);
      setIsEditorLoading(false);
      setShowEditorLoading(false);
    };
  }, [board, language]);

  const handleRun = () => alert(t("alertRun"));
  const handleStop = () => alert(t("alertStop"));
  const handleToggleDebug = () => setDebugMode((current) => !current);
  const handleUpload = () => {
    const currentDevice = devices.find((device) => device.id === board);
    alert(
      t("alertUpload", {
        device: currentDevice?.name || board,
      })
    );
  };
  const handleSave = () => alert(t("alertSave", { projectName }));
  const handleFile = () => alert(t("alertFile"));
  const handleEdit = () => alert(t("alertEdit"));

  const handleCopyCode = () => {
    navigator.clipboard
      .writeText(code)
      .then(() => alert(t("alertCopySuccess")))
      .catch(() => alert(t("alertCopyError")));
  };

  const handleDownloadCode = () => {
    const suggestedName = projectName.trim() || t("fallbackProjectName");
    const requestedName = window.prompt(t("promptFileName"), suggestedName);

    if (requestedName === null) return;

    const sanitizedName =
      requestedName.trim().replace(/[<>:\"/\\|?*\x00-\x1F]/g, "_") ||
      t("fallbackProjectName");

    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${sanitizedName.replace(/\s+/g, "_")}.ino`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleModeChange = (mode: "cargar" | "envivo") => {
    setActiveMode(mode);
    alert(
      t("modeChanged", {
        mode: mode === "cargar" ? t("modeUpload") : t("modeLive"),
      })
    );
  };

  const handleFullscreen = () => alert(t("alertFullscreen"));
  const handleRotate = () => alert(t("alertRotate"));

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
              <span className="nav-text">{t("navFile")}</span>
            </button>
            <button className="nav-btn" onClick={handleEdit}>
              <span className="nav-text">{t("navEdit")}</span>
            </button>
          </nav>

          <div className="project-name-container">
            <input
              type="text"
              className="project-name-input"
              value={projectName}
              onChange={(event) => setProjectName(event.target.value)}
            />
          </div>

          <div className="language-switcher" aria-label={t("language")}>
            <button
              className={`language-btn ${language === "es" ? "active" : ""}`}
              onClick={() => setLanguage("es")}
            >
              {t("languageSpanish")}
            </button>
            <button
              className={`language-btn ${language === "en" ? "active" : ""}`}
              onClick={() => setLanguage("en")}
            >
              {t("languageEnglish")}
            </button>
          </div>

          <button className="save-btn" onClick={handleSave}>
            <span className="btn-text">{t("save")}</span>
          </button>
        </div>

        <div className="header-right">
          <button className="action-btn run-btn" onClick={handleRun}>
            <span className="btn-text">{t("run")}</span>
          </button>
          <button
            className={`action-btn debug-btn ${debugMode ? "active" : ""}`}
            onClick={handleToggleDebug}
          >
            <span className="btn-text">
              {debugMode ? t("exitDebug") : t("debug")}
            </span>
          </button>
          <button className="action-btn stop-btn" onClick={handleStop}>
            <span className="btn-text">{t("stop")}</span>
          </button>
          <button className="action-btn upload-btn" onClick={handleUpload}>
            <span className="btn-text">{t("upload")}</span>
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
              title={t("fullscreen")}
              onClick={handleFullscreen}
            ></button>
            <button
              className="control-btn"
              title={t("rotate")}
              onClick={handleRotate}
            ></button>
          </div>

          <div className="tabs-container">
            <div className="tabs">
              <button className="tab active">{t("devices")}</button>
              <button className="tab">{t("objects")}</button>
              <button className="tab">{t("background")}</button>
            </div>
            <div className="tab-content">
              <div className="device-selector">
                <div
                  className="device-card selected"
                  onClick={() => setDeviceMenuOpen(!deviceMenuOpen)}
                >
                  <span className="device-name">
                    {devices.find((device) => device.id === board)?.name}
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
            <span className="mode-label">{t("mode")}</span>
            <div className="mode-toggle">
              <button
                className={`mode-btn ${activeMode === "cargar" ? "active" : ""}`}
                onClick={() => handleModeChange("cargar")}
              >
                {t("modeUpload")}
              </button>
              <button
                className={`mode-btn ${activeMode === "envivo" ? "active" : ""}`}
                onClick={() => handleModeChange("envivo")}
              >
                {t("modeLive")}
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
              {t("blocks")}
            </button>
            <button
              className={`workspace-tab ${activeTab === "code" ? "active" : ""}`}
              onClick={() => setActiveTab("code")}
            >
              {t("code")}
            </button>

            {activeTab === "code" && (
              <div className="code-actions">
                <button className="code-btn" onClick={handleCopyCode}>
                  {t("copy")}
                </button>
                <button className="code-btn download-btn" onClick={handleDownloadCode}>
                  {t("downloadIno")}
                </button>
              </div>
            )}
          </div>

          <div
            className={`workspace ${activeTab === "blocks" ? "visible" : "hidden"}`}
          >
            <div ref={blocklyDiv} className="blockly-container" />
            {editorLoadError && (
              <div className="workspace-loading workspace-loading-error">
                <div className="workspace-loading-copy">
                  <strong>{editorLoadError}</strong>
                  <span>{t("editorLoadingErrorDescription")}</span>
                </div>
              </div>
            )}
            {isEditorLoading && showEditorLoading && (
              <div className="workspace-loading">
                <div className="workspace-loading-brand">
                  <div className="workspace-loading-orbit orbit-one"></div>
                  <div className="workspace-loading-orbit orbit-two"></div>
                  <div className="workspace-loading-logo-wrap">
                    <img
                      className="workspace-loading-logo"
                      src="logo.webp"
                      alt="1bot"
                    />
                  </div>
                </div>
                <div className="workspace-loading-copy">
                  <strong>{t("editorLoading")}</strong>
                  <span>{t("editorLoadingDescription")}</span>
                </div>
              </div>
            )}
            {debugMode && (
              <aside className="symbol-table-panel">
                <div className="symbol-table-header">
                  <h3>{t("symbolTable")}</h3>
                  <span>
                    {symbolRows.length} {t("records")}
                  </span>
                </div>

                {symbolRows.length === 0 ? (
                  <p className="symbol-table-empty">{t("noVariables")}</p>
                ) : (
                  <div className="symbol-table-scroll">
                    <table className="symbol-table">
                      <thead>
                        <tr>
                          <th>{t("name")}</th>
                          <th>{t("type")}</th>
                          <th>{t("value")}</th>
                          <th>{t("init")}</th>
                          <th>{t("usage")}</th>
                          <th>{t("scope")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {symbolRows.map((row, index) => (
                          <tr key={`${row.name}-${row.scopeLevel}-${index}`}>
                            <td>{row.name}</td>
                            <td>{row.type ?? "null"}</td>
                            <td>{row.value === null ? "null" : String(row.value)}</td>
                            <td>{row.initialized ? t("yes") : t("no")}</td>
                            <td>{row.used ? t("yes") : t("no")}</td>
                            <td>{row.scopeLevel}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </aside>
            )}
          </div>

          <div className={`code-panel ${activeTab === "code" ? "visible" : "hidden"}`}>
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
              ? t("connectedStatus", {
                  board: board.toUpperCase(),
                  connection: connectionType.toUpperCase(),
                })
              : t("noConnection")}
          </span>
        </div>
        <div className="status-right">
          <span>{t("appTitle")}</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
