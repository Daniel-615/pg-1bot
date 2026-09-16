import { BookOpen, Cloud, Download, LoaderCircle, X } from "lucide-react";
import "../../styles/SaveOptionsDialog.css";

type SaveOptionsDialogProps = {
  projectName: string;
  isSavingCloud: boolean;
  isSavingExample: boolean;
  canManageExamples: boolean;
  hasExampleBlocks: boolean;
  onLocal: () => void;
  onCloud: () => void;
  onExample: () => void;
  onClose: () => void;
};

export function SaveOptionsDialog({ projectName, isSavingCloud, isSavingExample, canManageExamples, hasExampleBlocks, onLocal, onCloud, onExample, onClose }: SaveOptionsDialogProps) {
  const isSaving = isSavingCloud || isSavingExample;
  return (
    <div className="save-options-overlay" onClick={onClose}>
      <section className="save-options-dialog" role="dialog" aria-modal="true" aria-labelledby="save-options-title" onClick={(event) => event.stopPropagation()}>
        <div className="save-options-header">
          <div>
            <span className="save-options-kicker">Guardar proyecto</span>
            <h2 id="save-options-title">¿Dónde quieres guardarlo?</h2>
          </div>
          <button className="save-options-close" type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <p className="save-options-description">{projectName}.json estará disponible para volver a abrirlo después.</p>
        <div className="save-options-actions">
          <button className="save-option-card local" type="button" onClick={onLocal} disabled={isSaving}>
            <Download size={24} aria-hidden="true" />
            <span><strong>Guardar localmente</strong><small>Descargar el archivo en tu computadora</small></span>
          </button>
          <button className="save-option-card cloud" type="button" onClick={onCloud} disabled={isSaving}>
            {isSavingCloud ? <LoaderCircle className="save-options-spin" size={24} /> : <Cloud size={24} aria-hidden="true" />}
            <span><strong>{isSavingCloud ? "Guardando..." : "Guardar en la nube"}</strong><small>Guardar de forma segura en tu cuenta</small></span>
          </button>
          {canManageExamples && <button className="save-option-card example" type="button" onClick={onExample} disabled={isSaving || !hasExampleBlocks}>
            {isSavingExample ? <LoaderCircle className="save-options-spin" size={24} /> : <BookOpen size={24} aria-hidden="true" />}
            <span><strong>{isSavingExample ? "Guardando ejemplo..." : "Guardar como ejemplo"}</strong><small>{hasExampleBlocks ? "Disponible para cargarlo desde la biblioteca de ejemplos" : "Agrega al menos un bloque al playground"}</small></span>
          </button>}
        </div>
      </section>
    </div>
  );
}
