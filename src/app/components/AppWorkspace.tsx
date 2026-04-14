import type { RefObject } from "react";
import type { SymbolTableRow } from "../../core/blockEngine/semantic/base/symbolTable";

type AppWorkspaceProps = {
  activeTab: "blocks" | "code";
  code: string;
  debugMode: boolean;
  symbolRows: SymbolTableRow[];
  isEditorLoading: boolean;
  showEditorLoading: boolean;
  editorLoadError: string;
  blocklyDivRef: RefObject<HTMLDivElement | null>;
  onTabChange: (tab: "blocks" | "code") => void;
  onCopyCode: () => void;
  onDownloadCode: () => void;
  getScopeLabel: (row: SymbolTableRow) => string;
  t: (key: string, options?: Record<string, string | number>) => string;
};

export function AppWorkspace({
  activeTab,
  code,
  debugMode,
  symbolRows,
  isEditorLoading,
  showEditorLoading,
  editorLoadError,
  blocklyDivRef,
  onTabChange,
  onCopyCode,
  onDownloadCode,
  getScopeLabel,
  t,
}: AppWorkspaceProps) {
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

        {activeTab === "code" && (
          <div className="code-actions">
            <button className="code-btn" onClick={onCopyCode}>
              {t("copy")}
            </button>
            <button className="code-btn download-btn" onClick={onDownloadCode}>
              {t("downloadIno")}
            </button>
          </div>
        )}
      </div>

      <div className={`workspace ${activeTab === "blocks" ? "visible" : "hidden"}`}>
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
                <img className="workspace-loading-logo" src="logo.webp" alt="1bot" />
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
              <p className="symbol-table-empty">{t("noVariables")}</p>
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
                    {symbolRows.map((row, index) => (
                      <tr key={`${row.name}-${row.scopeId}-${index}`}>
                        <td>{row.name}</td>
                        <td>{row.type ?? "null"}</td>
                        <td>{row.value === null ? "null" : String(row.value)}</td>
                        <td>{row.initialized ? t("yes") : t("no")}</td>
                        <td>{row.used ? t("yes") : t("no")}</td>
                        <td>{getScopeLabel(row)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </aside>
        )}
      </div>

      <div className={`code-panel ${activeTab === "code" ? "visible" : "hidden"}`}>
        <div className="code-scroll">
          <pre className="code-content">
            <code>{code}</code>
          </pre>
        </div>
      </div>
    </main>
  );
}
