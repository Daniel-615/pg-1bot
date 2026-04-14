import type { DeviceOption } from "../types";

type AppSidebarProps = {
  board: string;
  activeMode: "cargar" | "envivo";
  deviceMenuOpen: boolean;
  currentDevice?: DeviceOption;
  devices: DeviceOption[];
  onBoardChange: (board: string) => void;
  onToggleDeviceMenu: () => void;
  onModeChange: (mode: "cargar" | "envivo") => void;
  onFullscreen: () => void;
  onRotate: () => void;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function AppSidebar({
  board,
  activeMode,
  deviceMenuOpen,
  currentDevice,
  devices,
  onBoardChange,
  onToggleDeviceMenu,
  onModeChange,
  onFullscreen,
  onRotate,
  t,
}: AppSidebarProps) {
  return (
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
        <button className="control-btn" title={t("fullscreen")} onClick={onFullscreen}></button>
        <button className="control-btn" title={t("rotate")} onClick={onRotate}></button>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button className="tab active">{t("devices")}</button>
          <button className="tab">{t("objects")}</button>
          <button className="tab">{t("background")}</button>
        </div>
        <div className="tab-content">
          <div className="device-selector">
            <select
              className="device-native-select"
              value={board}
              onChange={(event) => onBoardChange(event.target.value)}
              aria-label={t("devices")}
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
              aria-expanded={deviceMenuOpen}
              aria-haspopup="listbox"
            >
              <span className="device-name">{currentDevice?.name}</span>
            </button>

            {deviceMenuOpen && (
              <div className="device-menu" role="listbox" aria-label={t("devices")}>
                {devices.map((device) => (
                  <button
                    type="button"
                    key={device.id}
                    className="device-option"
                    onClick={() => onBoardChange(device.id)}
                  >
                    <span>{device.name}</span>
                    <img src={device.img} alt="img_boards" />
                  </button>
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
            onClick={() => onModeChange("cargar")}
          >
            {t("modeUpload")}
          </button>
          <button
            className={`mode-btn ${activeMode === "envivo" ? "active" : ""}`}
            onClick={() => onModeChange("envivo")}
          >
            {t("modeLive")}
          </button>
        </div>
      </div>
    </aside>
  );
}
