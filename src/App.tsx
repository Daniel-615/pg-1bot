import { useEffect, useState } from "react";
import type { SymbolTableRow } from "./core/blockEngine/semantic/base/symbolTable";
import i18n, { persistLanguage, type Language } from "./i18n";
import { DEVICES } from "./app/constants";
import { useBlocklyEditor } from "./app/hooks/useBlocklyEditor";
import { AppHeader } from "./app/components/AppHeader";
import { AppSidebar } from "./app/components/AppSidebar";
import { AppWorkspace } from "./app/components/AppWorkspace";
import { AppStatusBar } from "./app/components/AppStatusBar";
import "./App.css";

function App() {
  const [language, setLanguage] = useState<Language>(
    () => (i18n.language === "en" ? "en" : "es")
  );
  const [board, setBoard] = useState("esp32");
  const [projectName, setProjectName] = useState(() => i18n.t("projectUntitled"));
  const [activeTab, setActiveTab] = useState<"blocks" | "code">("blocks");
  const [connectionType] = useState<"usb" | "bluetooth" | "wifi">("usb");
  const [isConnected] = useState(false);
  const [deviceMenuOpen, setDeviceMenuOpen] = useState(false);
  const [activeMode, setActiveMode] = useState<"cargar" | "envivo">("envivo");
  const [symbolRows, setSymbolRows] = useState<SymbolTableRow[]>([]);
  const [debugMode, setDebugMode] = useState(false);
  const [, setLanguageVersion] = useState(0);

  const { blocklyDivRef, code, isEditorLoading, showEditorLoading, editorLoadError } =
    useBlocklyEditor({
      board,
      language,
      onSymbolTableChange: setSymbolRows,
    });

  const t = (key: string, options?: Record<string, string | number>) =>
    i18n.t(key, options);

  const currentDevice = DEVICES.find((device) => device.id === board);

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

  const handleRun = () => alert(t("alertRun"));
  const handleStop = () => alert(t("alertStop"));
  const handleToggleDebug = () => setDebugMode((current) => !current);
  const handleUpload = () => {
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

  const handleBoardChange = (nextBoard: string) => {
    setBoard(nextBoard);
    setDeviceMenuOpen(false);
  };

  const handleFullscreen = () => alert(t("alertFullscreen"));
  const handleRotate = () => alert(t("alertRotate"));

  const getScopeLabel = (row: SymbolTableRow) => {
    const scopeBase =
      row.scopeKind === "global"
        ? t("scopeGlobal")
        : t("scopeLocal", { id: row.scopeId });

    return row.active ? scopeBase : `${scopeBase} (${t("scopeClosed")})`;
  };

  return (
    <div className="app-container">
      <AppHeader
        language={language}
        projectName={projectName}
        debugMode={debugMode}
        onProjectNameChange={setProjectName}
        onLanguageChange={setLanguage}
        onSave={handleSave}
        onFile={handleFile}
        onEdit={handleEdit}
        onRun={handleRun}
        onToggleDebug={handleToggleDebug}
        onStop={handleStop}
        onUpload={handleUpload}
        t={t}
      />

      <div className="main-content">
        <AppSidebar
          board={board}
          activeMode={activeMode}
          deviceMenuOpen={deviceMenuOpen}
          currentDevice={currentDevice}
          devices={DEVICES}
          onBoardChange={handleBoardChange}
          onToggleDeviceMenu={() => setDeviceMenuOpen((current) => !current)}
          onModeChange={handleModeChange}
          onFullscreen={handleFullscreen}
          onRotate={handleRotate}
          t={t}
        />

        <AppWorkspace
          activeTab={activeTab}
          code={code}
          debugMode={debugMode}
          symbolRows={symbolRows}
          isEditorLoading={isEditorLoading}
          showEditorLoading={showEditorLoading}
          editorLoadError={editorLoadError}
          blocklyDivRef={blocklyDivRef}
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
        t={t}
      />
    </div>
  );
}

export default App;
