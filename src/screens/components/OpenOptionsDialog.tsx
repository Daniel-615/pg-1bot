import { useEffect, useState } from "react";
import { Cloud, Download, FileJson, LoaderCircle, X } from "lucide-react";
import { toast } from "react-toastify";
import { downloadCloudProject, getCloudProjects, type CloudProject } from "../../services/storage.service";
import "../../styles/OpenOptionsDialog.css";

type OpenOptionsDialogProps = {
  onLocal: () => void;
  onCloud: (project: CloudProject, data: unknown) => void;
  onClose: () => void;
};

export function OpenOptionsDialog({ onLocal, onCloud, onClose }: OpenOptionsDialogProps) {
  const [projects, setProjects] = useState<CloudProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [openingId, setOpeningId] = useState("");

  useEffect(() => {
    getCloudProjects().then(setProjects).catch(() => toast.error("No se pudieron cargar tus proyectos de la nube.")).finally(() => setLoading(false));
  }, []);

  const handleCloudProject = async (project: CloudProject) => {
    setOpeningId(project.id_proyecto);
    try {
      const data = await downloadCloudProject(project.id_proyecto);
      onCloud(project, data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir el proyecto.");
    } finally {
      setOpeningId("");
    }
  };

  return (
    <div className="open-options-overlay" onClick={onClose}>
      <section className="open-options-dialog" role="dialog" aria-modal="true" aria-labelledby="open-options-title" onClick={(event) => event.stopPropagation()}>
        <div className="open-options-header">
          <div><span className="open-options-kicker">Abrir proyecto</span><h2 id="open-options-title">¿De dónde quieres abrirlo?</h2></div>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X size={18} /></button>
        </div>
        <button className="open-local-option" type="button" onClick={onLocal}><Download size={21} /><span><strong>Abrir localmente</strong><small>Seleccionar un archivo JSON de tu computadora</small></span></button>
        <div className="cloud-projects-heading"><Cloud size={17} /><strong>Mis proyectos en la nube</strong></div>
        <div className="cloud-projects-list">
          {loading && <div className="open-options-state"><LoaderCircle className="open-options-spin" size={18} />Cargando proyectos...</div>}
          {!loading && projects.length === 0 && <div className="open-options-state"><FileJson size={18} />Todavía no tienes proyectos guardados.</div>}
          {projects.map((project) => <button className="cloud-project-row" key={project.id_proyecto} type="button" onClick={() => void handleCloudProject(project)} disabled={Boolean(openingId)}><FileJson size={18} /><span><strong>{project.nombre}</strong><small>{project.placa}</small></span>{openingId === project.id_proyecto && <LoaderCircle className="open-options-spin" size={16} />}</button>)}
        </div>
      </section>
    </div>
  );
}
