import { memo, useState } from "react";
import type { DeviceOption, SerialPortOption } from "../types";
import "./AppSidebar.css";

type SidebarTab = "devices" | "ports" | "background";

type AppSidebarProps = {
  board: string;
  isFullscreen: boolean;
  deviceMenuOpen: boolean;
  currentDevice?: DeviceOption;
  devices: DeviceOption[];
  onBoardChange: (board: string) => void;
  onToggleDeviceMenu: () => void;
  onFullscreen: () => void;
  onRotate: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
  ports: SerialPortOption[];
  selectedPort: string;
  setSelectedPort: (port: string) => void;
  fetchPorts: () => void;
  serialOpen: boolean;
  startSerialMonitor: () => void;
  stopSerialMonitor: () => void;
};

export const AppSidebar = memo(function AppSidebar({
  board,
  isFullscreen,
  deviceMenuOpen,
  currentDevice,
  devices,
  onBoardChange,
  onToggleDeviceMenu,
  onFullscreen,
  onRotate,
  t,
  ports,
  selectedPort,
  setSelectedPort,
  fetchPorts,
  serialOpen,
  startSerialMonitor,
  stopSerialMonitor,
}: AppSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("devices");

  return (
    <aside className="sidebar-left">
      <div className="device-preview">
        <div className="device-image">
          <img className="device-logo" src="/logo.webp" alt="1bot" />
        </div>
      </div>

      <div className="sidebar-controls">
        <button
          className="control-btn"
          title={isFullscreen ? "Salir de pantalla completa" : t("fullscreen")}
          aria-label={isFullscreen ? "Salir de pantalla completa" : t("fullscreen")}
          onClick={onFullscreen}
        >
          <span className="control-icon" aria-hidden="true">
            {isFullscreen ? "×" : "⛶"}
          </span>
        </button>
        <button
          className="control-btn"
          title={t("rotate")}
          aria-label={t("rotate")}
          onClick={onRotate}
        >
          <span className="control-icon" aria-hidden="true">
            ↻
          </span>
        </button>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button
            className={`tab ${activeTab === "devices" ? "active" : ""}`}
            onClick={() => setActiveTab("devices")}
          >
            {t("devices")}
          </button>
          <button
            className={`tab ${activeTab === "ports" ? "active" : ""}`}
            onClick={() => setActiveTab("ports")}
          >
            Puerto COM
          </button>
          <button
            className={`tab ${activeTab === "background" ? "active" : ""}`}
            onClick={() => setActiveTab("background")}
          >
            {t("background")}
          </button>
        </div>

        <div className="tab-content">
          {activeTab === "devices" && (
            <div className="device-selector-panel">
              <label>Placa</label>

              <div className="device-select-wrap">
                <select
                  className="device-native-select"
                  value={board}
                  onChange={(event) => onBoardChange(event.target.value)}
                >
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.name}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  className="device-card selected"
                  onClick={onToggleDeviceMenu}
                >
                  {currentDevice?.name}
                </button>

                {deviceMenuOpen && (
                  <div className="device-menu">
                    {devices.map((device) => (
                      <button
                        key={device.id}
                        className="device-option"
                        onClick={() => onBoardChange(device.id)}
                      >
                        <span>{device.name}</span>
                        <img src={device.img} alt="board" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "ports" && (
            <div className="ports-panel">
              <label>Puerto COM</label>

              <select
                value={selectedPort}
                onChange={(event) => setSelectedPort(event.target.value)}
              >
                <option value="">Seleccionar</option>
                {ports.map((port) => (
                  <option key={port.path} value={port.path}>
                    {port.friendlyName || port.path}
                  </option>
                ))}
              </select>

              <div className="port-actions">
                <button onClick={fetchPorts}>Actualizar</button>
                <button
                  onClick={() => {
                    if (serialOpen) stopSerialMonitor();
                    else startSerialMonitor();
                  }}
                >
                  {serialOpen ? "Cerrar monitor" : "Abrir monitor"}
                </button>
              </div>
            </div>
          )}

          {activeTab === "background" && (
            <div className="sidebar-empty-state">{t("background")}</div>
          )}
        </div>
      </div>
    </aside>
  );
});
