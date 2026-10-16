import { memo } from "react";
import "../../styles/AppStatusBar.css";

type AppStatusBarProps = {
  board: string;
  connectionType: "usb" | "bluetooth" | "wifi";
  isConnected: boolean;
  compileTargetLabel: string;
  agentDownloadUrl?: string;
  agentOffline: boolean;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export const AppStatusBar = memo(function AppStatusBar({
  board,
  connectionType,
  isConnected,
  compileTargetLabel,
  agentDownloadUrl,
  agentOffline,
  t,
}: AppStatusBarProps) {
  return (
    <footer className="status-bar">
      <div className="status-left">
        <span className={`status-indicator ${isConnected ? "connected" : ""}`}></span>
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
        {agentOffline ? (
          <div className="agent-install-prompt">
            <span className="agent-install-message">{t("arduinoAgentRequired")}</span>
            <a
              className="agent-install-link"
              href={agentDownloadUrl}
              target="_blank"
              rel="noreferrer"
            >
              {t("installArduinoAgent")}
            </a>
            <span className="agent-install-help">{t("arduinoAgentInstallHelp")}</span>
          </div>
        ) : (
          <span>{compileTargetLabel}</span>
        )}
        <span>{t("appTitle")}</span>
      </div>
    </footer>
  );
});
