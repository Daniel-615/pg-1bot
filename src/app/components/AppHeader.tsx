import type { Language } from "../../i18n";

type AppHeaderProps = {
  language: Language;
  projectName: string;
  debugMode: boolean;
  onProjectNameChange: (value: string) => void;
  onLanguageChange: (language: Language) => void;
  onSave: () => void;
  onFile: () => void;
  onEdit: () => void;
  onRun: () => void;
  onToggleDebug: () => void;
  onStop: () => void;
  onUpload: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function AppHeader({
  language,
  projectName,
  debugMode,
  onProjectNameChange,
  onLanguageChange,
  onSave,
  onFile,
  onEdit,
  onRun,
  onToggleDebug,
  onStop,
  onUpload,
  t,
}: AppHeaderProps) {
  return (
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
          <button className="nav-btn" onClick={onFile}>
            <span className="nav-text">{t("navFile")}</span>
          </button>
          <button className="nav-btn" onClick={onEdit}>
            <span className="nav-text">{t("navEdit")}</span>
          </button>
        </nav>

        <div className="project-name-container">
          <input
            type="text"
            className="project-name-input"
            value={projectName}
            onChange={(event) => onProjectNameChange(event.target.value)}
          />
        </div>

        <div className="language-switcher" aria-label={t("language")}>
          <button
            className={`language-btn ${language === "es" ? "active" : ""}`}
            onClick={() => onLanguageChange("es")}
          >
            {t("languageSpanish")}
          </button>
          <button
            className={`language-btn ${language === "en" ? "active" : ""}`}
            onClick={() => onLanguageChange("en")}
          >
            {t("languageEnglish")}
          </button>
        </div>

        <button className="save-btn" onClick={onSave}>
          <span className="btn-text">{t("save")}</span>
        </button>
      </div>

      <div className="header-right">
        <button className="action-btn run-btn" onClick={onRun}>
          <span className="btn-text">{t("run")}</span>
        </button>
        <button
          className={`action-btn debug-btn ${debugMode ? "active" : ""}`}
          onClick={onToggleDebug}
        >
          <span className="btn-text">{debugMode ? t("exitDebug") : t("debug")}</span>
        </button>
        <button className="action-btn stop-btn" onClick={onStop}>
          <span className="btn-text">{t("stop")}</span>
        </button>
        <button className="action-btn upload-btn" onClick={onUpload}>
          <span className="btn-text">{t("upload")}</span>
        </button>
      </div>
    </header>
  );
}
