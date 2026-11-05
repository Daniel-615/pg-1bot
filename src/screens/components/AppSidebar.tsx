import { memo, useState } from "react";
import type * as Blockly from "blockly";
import { ChevronRight, Usb } from "lucide-react";
import type { DeviceOption, SerialPortOption } from "../types";
import { BackgroundPanel, BackgroundStage } from "../../screens/background/BackgroundPanel";
import { initialBackgroundState, type BackgroundActorState } from "../../backgrounds/runtime";
import "../../styles/AppSidebar.css";

type SidebarTab = "devices" | "ports" | "background";
type LocalAgentStatus = "checking" | "online" | "offline";

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
  previewRotation: number;
  t: (key: string, options?: Record<string, string | number>) => string;
  ports: SerialPortOption[];
  selectedPort: string;
  setSelectedPort: (port: string) => void;
  fetchPorts: (showFeedback?: boolean) => void;
  compileMode: "cloud" | "local";
  onCompileModeChange: (mode: "cloud" | "local") => void;
  agentDownloadUrl: string;
  onCheckLocalAgent: () => Promise<boolean>;
  localAgentStatus: LocalAgentStatus;
  onRequestSerialDevice: () => void;
  webSerialDeviceLabel: string;
  serialOpen: boolean;
  startSerialMonitor: () => void;
  stopSerialMonitor: () => void;
  workspace: Blockly.Workspace | null;
  editorMode: "device" | "background";
  onEditorModeChange: (mode: "device" | "background") => void;
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
  previewRotation,
  t,
  ports,
  selectedPort,
  setSelectedPort,
  fetchPorts,
  compileMode,
  onCompileModeChange,
  agentDownloadUrl,
  onCheckLocalAgent,
  localAgentStatus,
  onRequestSerialDevice,
  webSerialDeviceLabel,
  serialOpen,
  startSerialMonitor,
  stopSerialMonitor,
  workspace,
  editorMode,
  onEditorModeChange,
}: AppSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>("devices");
  const [backgroundActor, setBackgroundActor] = useState<BackgroundActorState>(initialBackgroundState);
  const [isBackgroundRunning, setIsBackgroundRunning] = useState(false);

  const selectTab = (tab: SidebarTab) => {
    setActiveTab(tab);
    onEditorModeChange(tab === "background" ? "background" : "device");
  };

  return (
    <aside className="sidebar-left">
      <div className="device-preview">
        <div
          className="device-image"
          style={{ transform: `rotate(${previewRotation}deg)` }}
        >
          {editorMode === "background" ? (
            <BackgroundStage actor={backgroundActor} />
          ) : (
            <img className="device-logo" src="/logo.webp" alt="1bot" />
          )}
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
            onClick={() => selectTab("devices")}
          >
            {t("devices")}
          </button>
          <button
            className={`tab ${activeTab === "ports" ? "active" : ""}`}
            onClick={() => selectTab("ports")}
          >
            Puerto COM
          </button>
          <button
            className={`tab ${activeTab === "background" ? "active" : ""}`}
            onClick={() => selectTab("background")}
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
               <label htmlFor="compile-mode">Compilación</label>
               <select id="compile-mode" value={compileMode} onChange={(event) => onCompileModeChange(event.target.value as "cloud" | "local")}>
                 <option value="cloud">Nube</option>
                 <option value="local">Agente local</option>
               </select>

               {compileMode === "cloud" ? (
                 <>
                    <label htmlFor="web-serial-port">Puerto Web Serial</label>
                    <button
                      id="web-serial-port"
                      type="button"
                      className={`web-serial-button${webSerialDeviceLabel ? " is-connected" : ""}`}
                      onClick={onRequestSerialDevice}
                      aria-label={webSerialDeviceLabel ? `Cambiar puerto ${webSerialDeviceLabel}` : "Seleccionar puerto USB"}
                    >
                      <span className="web-serial-icon" aria-hidden="true">
                        <Usb size={16} strokeWidth={2.2} />
                      </span>
                      <span className="web-serial-copy">
                        <span className="web-serial-title">
                          {webSerialDeviceLabel || "Seleccionar puerto USB"}
                        </span>
                        <span className="web-serial-status">
                          {webSerialDeviceLabel ? "Puerto conectado" : "Conecta tu placa por USB"}
                        </span>
                      </span>
                      <ChevronRight className="web-serial-arrow" size={17} aria-hidden="true" />
                    </button>
                 </>
                ) : (
                  <>
                    <label>Puerto COM del agente local</label>
                    <div className={`local-agent-status is-${localAgentStatus}`} role="status" aria-live="polite">
                      <span className="local-agent-status-dot" aria-hidden="true" />
                      <span>{t(`arduinoAgentStatus${localAgentStatus[0].toUpperCase()}${localAgentStatus.slice(1)}`)}</span>
                    </div>
                    {localAgentStatus === "offline" && (
                      <div className="local-agent-help">
                        <p>{t("arduinoAgentRequired")}</p>
                        <div className="local-agent-actions">
                          <a href={agentDownloadUrl} target="_blank" rel="noreferrer" className="local-agent-download">
                            {t("downloadArduinoAgent")}
                          </a>
                          <button type="button" className="local-agent-retry" onClick={() => void onCheckLocalAgent()}>
                            {t("retryArduinoAgent")}
                          </button>
                        </div>
                      </div>
                    )}
                    <select
                     value={selectedPort}
                     onChange={(event) => setSelectedPort(event.target.value)}
                     aria-label="Puerto COM del agente local"
                   >
                     <option value="">Seleccionar puerto COM</option>
                     {ports.map((port) => (
                       <option key={port.path} value={port.path}>
                         {port.friendlyName || port.path}
                       </option>
                     ))}
                   </select>
                   <div className="port-actions">
                      <button onClick={() => void fetchPorts()}>Actualizar puertos</button>
                   </div>
                 </>
               )}

                <div className="port-actions">
                  <button
                    disabled={compileMode === "cloud"}
                    title={compileMode === "cloud" ? "El monitor serial requiere el agente local" : undefined}
                    onClick={() => {
                      if (serialOpen) stopSerialMonitor();
                      else startSerialMonitor();
                    }}
                  >
                    {compileMode === "cloud" ? "Monitor solo local" : serialOpen ? "Cerrar monitor" : "Abrir monitor"}
                  </button>
                </div>

             </div>
          )}

          {activeTab === "background" && (
            <BackgroundPanel
              workspace={workspace}
              actor={backgroundActor}
              isRunning={isBackgroundRunning}
              setActor={setBackgroundActor}
              setIsRunning={setIsBackgroundRunning}
            />
          )}
        </div>
      </div>
    </aside>
  );
});
