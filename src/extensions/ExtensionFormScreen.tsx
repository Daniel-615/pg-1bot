import { useState, type FormEvent } from "react";
import { toast } from "react-toastify";
import type { AuthUser } from "../api/auth";
import { createExtension } from "../api/extensions";
import "./ExtensionFormScreen.css";

type ExtensionFormScreenProps = {
  user: AuthUser | null;
  isAdmin: boolean;
  onBack: () => void;
};

export function ExtensionFormScreen({ user, isAdmin, onBack }: ExtensionFormScreenProps) {
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [estadoId, setEstadoId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = user?.userId ?? user?.id;

    if (!isAdmin) {
      toast.error("Solo personal autorizado puede crear extensiones.");
      return;
    }

    if (!userId) {
      toast.error("No se pudo identificar el usuario actual.");
      return;
    }

    if (!nombre.trim() || !version.trim() || !estadoId.trim()) {
      toast.error("Completa nombre, versión y estado.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await createExtension({
        nombre: nombre.trim(),
        descripcion: descripcion.trim() || undefined,
        version: version.trim(),
        id_usuario: userId,
        id_estado_extension: estadoId.trim(),
      });

      if (!result.ok) {
        toast.error(result.message ?? "No se pudo crear la extensión.");
        return;
      }

      toast.success("Extensión creada exitosamente.");
      setNombre("");
      setDescripcion("");
      setVersion("1.0.0");
      setEstadoId("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error al crear la extensión.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <main className="extension-form-page">
        <section className="extension-form-card">
          <h1>Extensiones</h1>
          <p>No tienes permisos para acceder al formulario de extensiones.</p>
          <button type="button" className="extension-secondary-btn" onClick={onBack}>
            Volver al editor
          </button>
        </section>
      </main>
    );
  }

  return (
    <main className="extension-form-page">
      <section className="extension-form-card">
        <div className="extension-form-header">
          <div>
            <span>Gestión de extensiones</span>
            <h1>Crear extensión</h1>
          </div>
          <button type="button" className="extension-secondary-btn" onClick={onBack}>
            Volver al editor
          </button>
        </div>

        <form className="extension-form" onSubmit={handleSubmit}>
          <label htmlFor="extension-name">Nombre</label>
          <input
            id="extension-name"
            value={nombre}
            onChange={(event) => setNombre(event.target.value)}
            placeholder="Sensores personalizados"
            disabled={isSubmitting}
          />

          <label htmlFor="extension-description">Descripción</label>
          <textarea
            id="extension-description"
            value={descripcion}
            onChange={(event) => setDescripcion(event.target.value)}
            placeholder="Describe para qué sirve la extensión"
            disabled={isSubmitting}
          />

          <div className="extension-form-grid">
            <div>
              <label htmlFor="extension-version">Versión</label>
              <input
                id="extension-version"
                value={version}
                onChange={(event) => setVersion(event.target.value)}
                placeholder="1.0.0"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label htmlFor="extension-status">ID estado extensión</label>
              <input
                id="extension-status"
                value={estadoId}
                onChange={(event) => setEstadoId(event.target.value)}
                placeholder="UUID del estado"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button type="submit" className="extension-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Creando..." : "Crear extensión"}
          </button>
        </form>
      </section>
    </main>
  );
}
