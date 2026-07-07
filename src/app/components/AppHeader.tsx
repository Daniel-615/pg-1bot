import { memo } from "react";
import type { Language } from "../../i18n";
import "./css/AppHeader.css";

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
  onExamples: () => void;
  onLogout: () => void;
  isUploading: boolean;
  userName: string;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export const AppHeader = memo(function AppHeader({
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
  onExamples,
  onLogout,
  isUploading,
  userName,
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
          <button className="nav-btn" onClick={onExamples}>
            <span className="nav-text">📚 {t("examples")}</span>
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
        <button className="action-btn run-btn" onClick={onRun} disabled={isUploading}>
          <span className={`action-icon ${isUploading ? "robot-walk" : ""}`}>
            {isUploading ? <img src="logo.webp" alt="1bot" /> : "▶"}
          </span>
          <span className="btn-text">{isUploading ? t("uploading") : t("run")}</span>
        </button>
        <button
          className={`action-btn debug-btn ${debugMode ? "active" : ""}`}
          onClick={onToggleDebug}
        >
          <span className="action-icon">⌁</span>
          <span className="btn-text">{debugMode ? t("exitDebug") : t("debug")}</span>
        </button>

        <div className="user-menu">
          <span className="user-name">{userName}</span>
          <button className="logout-btn" onClick={onLogout}>
            Salir
          </button>
        </div>
      </div>
    </header>
  );
});
