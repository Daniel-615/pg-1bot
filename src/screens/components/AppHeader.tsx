import { memo } from "react";
import { BriefcaseBusiness, Bug, BugOff, GraduationCap, LogOut, Save, ShieldCheck, UserRound } from "lucide-react";
import type { Language } from "../../i18n";
import "../../styles/AppHeader.css";

type AppHeaderProps = {
  language: Language;
  projectName: string;
  debugMode: boolean;
  onProjectNameChange: (value: string) => void;
  onLanguageChange: (language: Language) => void;
  onSave: () => void;
  onFile: () => void;
  onEdit: () => void;
  onDashboard: () => void;
  onRun: () => void;
  onToggleDebug: () => void;
  onExamples: () => void;
  onLogout: () => void;
  canAccessDashboard: boolean;
  isUploading: boolean;
  userName: string;
  userRole: "admin" | "student" | "staff" | "user";
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
  onDashboard,
  onRun,
  onToggleDebug,
  onExamples,
  onLogout,
  canAccessDashboard,
  isUploading,
  userName,
  userRole,
  t,
}: AppHeaderProps) {
  const RoleIcon = userRole === "admin" ? ShieldCheck : userRole === "student" ? GraduationCap : userRole === "staff" ? BriefcaseBusiness : UserRound;
  const roleLabel = userRole === "admin" ? "Administrador" : userRole === "student" ? "Estudiante" : userRole === "staff" ? "Personal" : "Usuario";

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
            <span className="nav-text">{t("examples")}</span>
          </button>
          {canAccessDashboard && (
            <button className="nav-btn" onClick={onDashboard}>
              <span className="nav-text">Dashboard</span>
            </button>
          )}
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
            aria-label="Español"
            title="Español"
          >
            <img className="language-flag" src="/flag-es.svg" alt="" aria-hidden="true" />
            <span className="language-code">ES</span>
          </button>
          <button
            className={`language-btn ${language === "en" ? "active" : ""}`}
            onClick={() => onLanguageChange("en")}
            aria-label="English"
            title="English"
          >
            <img className="language-flag" src="/flag-us.svg" alt="" aria-hidden="true" />
            <span className="language-code">EN</span>
          </button>
        </div>

        <button className="save-btn" onClick={onSave}>
          <Save size={16} aria-hidden="true" />
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
          {debugMode ? <BugOff size={16} aria-hidden="true" /> : <Bug size={16} aria-hidden="true" />}
          <span className="btn-text">{debugMode ? t("exitDebug") : t("debug")}</span>
        </button>

        <div className="user-menu">
          <div className="user-identity" title={roleLabel}>
            <span className={`user-role-icon user-role-${userRole}`} aria-label={roleLabel}>
              <RoleIcon size={16} aria-hidden="true" />
            </span>
            <span className="user-name">{userName}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} aria-label="Salir" title="Salir">
            <LogOut size={16} strokeWidth={2.2} aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
});
