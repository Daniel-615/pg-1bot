import { memo, useMemo } from "react";
import type { RefObject } from "react";
import type { SymbolTableRow } from "../../core/blockEngine/semantic/base/symbolTable";
import type { WokwiProjectFiles, WokwiSimulationState } from "../../screens/simulator/wokwi";
import "./css/AppWorkspace.css";

type AppWorkspaceProps = {
  activeTab: "blocks" | "code" | "simulator";
  board: string;
  code: string;
  debugMode: boolean;
  symbolRows: SymbolTableRow[];
  workspaceVersion: number;
  isEditorLoading: boolean;
  showEditorLoading: boolean;
  editorLoadError: string;
  blocklyDivRef: RefObject<HTMLDivElement | null>;
  wokwiState: WokwiSimulationState;
  wokwiPreviewFiles: WokwiProjectFiles | null;
  onTabChange: (tab: "blocks" | "code" | "simulator") => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  onCopyDiagramJson: () => void;
  onOpenWokwi: () => void;
  getScopeLabel: (row: SymbolTableRow) => string;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export const AppWorkspace = memo(function AppWorkspace({
  activeTab,
  code,
  debugMode,
  symbolRows,
  isEditorLoading,
  showEditorLoading,
  editorLoadError,
  blocklyDivRef,
  wokwiState,
  wokwiPreviewFiles,
  onTabChange,
  onCopyCode,
  onDownloadCode,
  onCopyDiagramJson,
  onOpenWokwi,
  getScopeLabel,
  t,
}: AppWorkspaceProps) {

  const symbolTableRows = useMemo(
    () =>
      symbolRows.map((row, index) => (
        <tr key={`${row.name}-${row.scopeId}-${index}`}>
          <td>{row.name}</td>
          <td>{row.type ?? "null"}</td>
          <td>{row.value === null ? "null" : String(row.value)}</td>
          <td>{row.initialized ? t("yes") : t("no")}</td>
          <td>{row.used ? t("yes") : t("no")}</td>
          <td>{getScopeLabel(row)}</td>
        </tr>
      )),
    [getScopeLabel, symbolRows, t]
  );

  const diagramJson = useMemo(
    () => JSON.stringify(wokwiState.files?.diagram ?? wokwiPreviewFiles?.diagram ?? null, null, 2),
    [wokwiPreviewFiles?.diagram, wokwiState.files?.diagram]
  );

  return (
    <main className="workspace-container">
      <div className="workspace-tabs">
        <button
          className={`workspace-tab ${activeTab === "blocks" ? "active" : ""}`}
          onClick={() => onTabChange("blocks")}
        >
          {t("blocks")}
        </button>

        <button
          className={`workspace-tab ${activeTab === "code" ? "active" : ""}`}
          onClick={() => onTabChange("code")}
        >
          {t("code")}
        </button>

        <button
          className={`workspace-tab ${activeTab === "simulator" ? "active" : ""}`}
          onClick={() => onTabChange("simulator")}
        >
          {t("simulator")}
        </button>

        {activeTab === "code" && (
          <div className="code-actions">
            <button className="code-btn" onClick={onCopyCode}>
              {t("copy")}
            </button>

            <button
              className="code-btn download-btn"
              onClick={onDownloadCode}
            >
              {t("downloadIno")}
            </button>
          </div>
        )}

        {activeTab === "simulator" && (
          <div className="code-actions">
            <button className="code-btn" onClick={onCopyDiagramJson} disabled={!wokwiPreviewFiles}>
              {t("copyDiagramJson")}
            </button>

            <button className="code-btn" onClick={onOpenWokwi}>
              {t("openWokwi")}
            </button>

            <span className="simulator-runtime-label">Wokwi</span>
          </div>
        )}
      </div>

      <div
        className={`workspace ${
          activeTab === "blocks" ? "visible" : "hidden"
        }`}
      >
        <div ref={blocklyDivRef} className="blockly-container" />

        {editorLoadError && (
          <div className="workspace-loading workspace-loading-error">
            <div className="workspace-loading-copy">
              <strong>{editorLoadError}</strong>
              <span>{t("editorLoadingErrorDescription")}</span>
            </div>
          </div>
        )}

        {isEditorLoading && showEditorLoading && (
          <div className="workspace-loading">
            <div className="workspace-loading-brand">
              <div className="workspace-loading-orbit orbit-one"></div>
              <div className="workspace-loading-orbit orbit-two"></div>

              <div className="workspace-loading-logo-wrap">
                <img
                  className="workspace-loading-logo"
                  src="logo.webp"
                  alt="1bot"
                />
              </div>
            </div>

            <div className="workspace-loading-copy">
              <strong>{t("editorLoading")}</strong>
              <span>{t("editorLoadingDescription")}</span>
            </div>
          </div>
        )}

        {debugMode && (
          <aside className="symbol-table-panel">
            <div className="symbol-table-header">
              <h3>{t("symbolTable")}</h3>

              <span>
                {symbolRows.length} {t("records")}
              </span>
            </div>

            {symbolRows.length === 0 ? (
              <p className="symbol-table-empty">
                {t("noVariables")}
              </p>
            ) : (
              <div className="symbol-table-scroll">
                <table className="symbol-table">
                  <thead>
                    <tr>
                      <th>{t("name")}</th>
                      <th>{t("type")}</th>
                      <th>{t("value")}</th>
                      <th>{t("init")}</th>
                      <th>{t("usage")}</th>
                      <th>{t("scope")}</th>
                    </tr>
                  </thead>

                  <tbody>
                    {symbolTableRows}
                  </tbody>
                </table>
              </div>
            )}
          </aside>
        )}
      </div>

      {activeTab === "code" && (
        <div className="code-panel visible">
          <div className="code-scroll">
            <pre className="code-content">
              <code>{code}</code>
            </pre>
          </div>
        </div>
      )}

      {activeTab === "simulator" && (
        <div className="simulator-panel visible">
          <div
            className={`diagram-preview ${!wokwiPreviewFiles ? "disabled" : ""}`}
          >
            <div className="diagram-preview-header">
              <div>
                <span>{t("wokwiDiagramPreview")}</span>
                <strong>diagram.json</strong>
              </div>

              <small>
                {wokwiState.isLoading
                  ? t("wokwiPreparing")
                  : wokwiState.projectUrl
                    ? t("wokwiReady")
                    : t("clickRunSimulator")}
              </small>
            </div>

            <pre className="diagram-preview-code">
              {wokwiPreviewFiles ? diagramJson : t("wokwiDiagramUnavailable")}
            </pre>
          </div>

          {!wokwiState.isLoading && wokwiState.error && (
            <div className="simulator-error">
              <div>
                <p>{wokwiState.error}</p>
                <button className="code-btn" onClick={onOpenWokwi}>
                  {t("openWokwiTemplate")}
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </main>
  );
});
