import { memo, useState } from "react";
import { BriefcaseBusiness, Bug, BugOff, FileText, GraduationCap, LayoutDashboard, LogOut, Menu, Pencil, Play, Save, ShieldCheck, UserRound, X } from "lucide-react";
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const RoleIcon = userRole === "admin" ? ShieldCheck : userRole === "student" ? GraduationCap : userRole === "staff" ? BriefcaseBusiness : UserRound;
  const roleLabel = userRole === "admin" ? "Administrador" : userRole === "student" ? "Estudiante" : userRole === "staff" ? "Personal" : "Usuario";
  const runMobileAction = (action: () => void) => {
    action();
    setMobileMenuOpen(false);
  };

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

        <button
          className="mobile-menu-toggle"
          type="button"
          aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
          aria-expanded={mobileMenuOpen}
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          {mobileMenuOpen ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
        </button>

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

      {mobileMenuOpen && (
        <div className="mobile-menu">
          <button type="button" onClick={() => runMobileAction(onFile)}><FileText size={17} aria-hidden="true" />{t("navFile")}</button>
          <button type="button" onClick={() => runMobileAction(onEdit)}><Pencil size={17} aria-hidden="true" />{t("navEdit")}</button>
          <button type="button" onClick={() => runMobileAction(onExamples)}><LayoutDashboard size={17} aria-hidden="true" />{t("examples")}</button>
          {canAccessDashboard && <button type="button" onClick={() => runMobileAction(onDashboard)}><LayoutDashboard size={17} aria-hidden="true" />Dashboard</button>}
          <div className="mobile-menu-divider" />
          <button type="button" className="mobile-menu-run" disabled={isUploading} onClick={() => runMobileAction(onRun)}><Play size={17} fill="currentColor" aria-hidden="true" />{isUploading ? t("uploading") : t("run")}</button>
          <button type="button" className="mobile-menu-debug" onClick={() => runMobileAction(onToggleDebug)}>{debugMode ? <BugOff size={17} aria-hidden="true" /> : <Bug size={17} aria-hidden="true" />}{debugMode ? t("exitDebug") : t("debug")}</button>
        </div>
      )}
    </header>
  );
});
