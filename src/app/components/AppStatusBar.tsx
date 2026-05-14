import { memo } from "react";
import "./css/AppStatusBar.css";

type AppStatusBarProps = {
  board: string;
  connectionType: "usb" | "bluetooth" | "wifi";
  isConnected: boolean;
  compileTargetLabel: string;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export const AppStatusBar = memo(function AppStatusBar({
  board,
  connectionType,
  isConnected,
  compileTargetLabel,
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
        <span>{compileTargetLabel}</span>
        <span>{t("appTitle")}</span>
      </div>
    </footer>
  );
});
