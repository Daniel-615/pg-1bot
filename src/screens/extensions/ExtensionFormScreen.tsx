import { useState, type FormEvent } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Blocks, Cable, ChevronRight, CircleDot, Database, FolderTree, Layers3, ListChecks, Link2, Puzzle, Server, Settings2, Shapes } from "lucide-react";
import type { AuthUser } from "../../services/auth.service";
import { useCreateBlock, useCreateExtension, useExtensionAdminData, useUpdateBlock, useUpdateExtension } from "../../hooks/extensions/extensionsHook";
import { QueryFreshness } from "../components/QueryFreshness";
import "./ExtensionFormScreen.css";

type ExtensionFormScreenProps = {
  user: AuthUser | null;
  isAdmin: boolean;
  onBack: () => void;
  initialPanel?: PanelKey;
};

type PanelKey = "extensions" | "blocks" | "parameters" | "options" | "plates" | "categories" | "extensionCategories" | "blockTypes" | "blockStatuses" | "dataTypes" | "blockShapes" | "connectionTypes" | "blockConnections" | "blockPlates" | "extensionStatuses";

export function ExtensionFormScreen({ user, isAdmin, onBack, initialPanel = "extensions" }: ExtensionFormScreenProps) {
  const { t } = useTranslation();
  const [nombre, setNombre] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [version, setVersion] = useState("1.0.0");
  const [estadoId, setEstadoId] = useState("");
  const [activePanel, setActivePanel] = useState<PanelKey>(initialPanel);
  const [blockName, setBlockName] = useState("");
  const [blockDescription, setBlockDescription] = useState("");
  const [blockOrder, setBlockOrder] = useState("1");
  const [blockExtensionId, setBlockExtensionId] = useState("");
  const [blockTypeId, setBlockTypeId] = useState("");
  const [blockStatusId, setBlockStatusId] = useState("");
  const [editingExtensionId, setEditingExtensionId] = useState<string | null>(null);
  const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
  const createExtensionMutation = useCreateExtension();
  const updateExtensionMutation = useUpdateExtension();
  const createBlockMutation = useCreateBlock();
  const updateBlockMutation = useUpdateBlock();
  const adminData = useExtensionAdminData();
  const isSubmitting = createExtensionMutation.isPending || updateExtensionMutation.isPending || createBlockMutation.isPending || updateBlockMutation.isPending;
  const extensions = adminData.extensions.data ?? [];
  const uniqueStatuses = adminData.extensionStatuses.data ?? [];
  const catalogViews: Record<string, { title: string; description: string; data: Array<Record<string, unknown>>; loading: boolean; updatedAt: number; isFetching: boolean }> = {
    plates: { title: t("platesCatalog"), description: t("platesDescription"), data: (adminData.plates.data ?? []) as Array<Record<string, unknown>>, loading: adminData.plates.isLoading, updatedAt: adminData.plates.dataUpdatedAt, isFetching: adminData.plates.isFetching },
    categories: { title: t("categoryCatalog"), description: t("categoriesDescription"), data: (adminData.categories.data ?? []) as Array<Record<string, unknown>>, loading: adminData.categories.isLoading, updatedAt: adminData.categories.dataUpdatedAt, isFetching: adminData.categories.isFetching },
    extensionCategories: { title: t("extensionCategoriesCatalog"), description: t("extensionCategoriesDescription"), data: (adminData.extensionCategories.data ?? []) as Array<Record<string, unknown>>, loading: adminData.extensionCategories.isLoading, updatedAt: adminData.extensionCategories.dataUpdatedAt, isFetching: adminData.extensionCategories.isFetching },
    blockTypes: { title: t("blockTypesCatalog"), description: t("blockTypesDescription"), data: (adminData.blockTypes.data ?? []) as Array<Record<string, unknown>>, loading: adminData.blockTypes.isLoading, updatedAt: adminData.blockTypes.dataUpdatedAt, isFetching: adminData.blockTypes.isFetching },
    blockStatuses: { title: t("blockStatusesCatalog"), description: t("blockStatusesDescription"), data: (adminData.blockStatuses.data ?? []) as Array<Record<string, unknown>>, loading: adminData.blockStatuses.isLoading, updatedAt: adminData.blockStatuses.dataUpdatedAt, isFetching: adminData.blockStatuses.isFetching },
    dataTypes: { title: t("dataTypesCatalog"), description: t("dataTypesDescription"), data: (adminData.dataTypes.data ?? []) as Array<Record<string, unknown>>, loading: adminData.dataTypes.isLoading, updatedAt: adminData.dataTypes.dataUpdatedAt, isFetching: adminData.dataTypes.isFetching },
    blockShapes: { title: t("shapesCatalog"), description: t("shapesDescription"), data: (adminData.blockShapes.data ?? []) as Array<Record<string, unknown>>, loading: adminData.blockShapes.isLoading, updatedAt: adminData.blockShapes.dataUpdatedAt, isFetching: adminData.blockShapes.isFetching },
    connectionTypes: { title: t("connectionTypesCatalog"), description: t("connectionTypesDescription"), data: (adminData.connectionTypes.data ?? []) as Array<Record<string, unknown>>, loading: adminData.connectionTypes.isLoading, updatedAt: adminData.connectionTypes.dataUpdatedAt, isFetching: adminData.connectionTypes.isFetching },
    blockConnections: { title: t("blockConnectionsCatalog"), description: t("blockConnectionsDescription"), data: (adminData.blockConnections.data ?? []) as Array<Record<string, unknown>>, loading: adminData.blockConnections.isLoading, updatedAt: adminData.blockConnections.dataUpdatedAt, isFetching: adminData.blockConnections.isFetching },
    blockPlates: { title: t("blockPlatesCatalog"), description: t("blockPlatesDescription"), data: (adminData.blockPlates.data ?? []) as Array<Record<string, unknown>>, loading: adminData.blockPlates.isLoading, updatedAt: adminData.blockPlates.dataUpdatedAt, isFetching: adminData.blockPlates.isFetching },
    extensionStatuses: { title: t("extensionStatusesCatalog"), description: t("extensionStatusesDescription"), data: (adminData.extensionStatuses.data ?? []) as Array<Record<string, unknown>>, loading: adminData.extensionStatuses.isLoading, updatedAt: adminData.extensionStatuses.dataUpdatedAt, isFetching: adminData.extensionStatuses.isFetching },
  };
  const freshness = catalogViews[activePanel] ?? {
    title: activePanel === "extensions" ? "Extensiones" : activePanel === "blocks" ? "Bloques" : activePanel === "parameters" ? "Parámetros" : "Opciones",
    updatedAt: activePanel === "extensions" ? adminData.extensions.dataUpdatedAt : activePanel === "blocks" ? adminData.blocks.dataUpdatedAt : activePanel === "parameters" ? adminData.parameters.dataUpdatedAt : adminData.options.dataUpdatedAt,
    isFetching: activePanel === "extensions" ? adminData.extensions.isFetching : activePanel === "blocks" ? adminData.blocks.isFetching : activePanel === "parameters" ? adminData.parameters.isFetching : adminData.options.isFetching,
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const userId = user?.userId ?? user?.id;

    if (!isAdmin) {
      toast.error(t("authorizedExtension"));
      return;
    }

    if (!userId) {
      toast.error(t("userNotFound"));
      return;
    }

    const selectedStatus = estadoId || uniqueStatuses[0]?.id_estado_extension;

    if (!nombre.trim() || !version.trim() || !selectedStatus) {
      toast.error(t("extensionFormRequired"));
      return;
    }

    try {
      if (editingExtensionId) {
        await updateExtensionMutation.mutateAsync({ id: editingExtensionId, nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, version: version.trim(), id_estado_extension: selectedStatus });
      } else {
        const result = await createExtensionMutation.mutateAsync({ nombre: nombre.trim(), descripcion: descripcion.trim() || undefined, version: version.trim(), id_usuario: userId, id_estado_extension: selectedStatus });
        if (!result.ok) {
          toast.error(result.message ?? t("noExtensionCreated"));
          return;
        }
      }

      toast.success(editingExtensionId ? t("extensionUpdated") : t("extensionCreated"));
      setNombre("");
      setDescripcion("");
      setVersion("1.0.0");
      setEstadoId("");
      setEditingExtensionId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("noExtensionCreated"));
    }
  };

  const handleBlockSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!blockName.trim() || !blockExtensionId || !blockTypeId || !blockStatusId || !blockOrder) {
      toast.error(t("extensionFieldsRequired"));
      return;
    }

    try {
      if (editingBlockId) {
        await updateBlockMutation.mutateAsync({ id: editingBlockId, nombre: blockName.trim(), descripcion: blockDescription.trim() || undefined, orden: Number(blockOrder) });
      } else {
        await createBlockMutation.mutateAsync({ nombre: blockName.trim(), descripcion: blockDescription.trim() || undefined, id_extension: blockExtensionId, id_tipo_bloque: blockTypeId, id_estado_bloque: blockStatusId, orden: Number(blockOrder) });
      }
      toast.success(editingBlockId ? t("blockUpdated") : t("blockCreated"));
      setBlockName("");
      setBlockDescription("");
      setBlockOrder("1");
      setEditingBlockId(null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : t("noBlockCreated"));
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
      <div className="extension-layout">
      <aside className="extension-sidebar" aria-label="Secciones de extensiones">
        <div className="extension-sidebar-brand">
          <span className="extension-sidebar-mark"><Puzzle size={18} /></span>
          <div><strong>Builder</strong><small>{t("extensionCenter")}</small></div>
        </div>
        <nav className="extension-sidebar-nav">
          <span className="extension-sidebar-label">{t("catalog")}</span>
          {[
            ["extensions", Puzzle, t("extensions"), extensions.length],
            ["blocks", Blocks, t("blocks"), adminData.blocks.data?.length ?? 0],
            ["parameters", Settings2, t("parameters"), adminData.parameters.data?.length ?? 0],
            ["options", ListChecks, t("options"), adminData.options.data?.length ?? 0],
            ["plates", Server, t("platesCatalog"), adminData.plates.data?.length ?? 0],
            ["categories", FolderTree, t("categoryCatalog"), adminData.categories.data?.length ?? 0],
            ["extensionCategories", Link2, t("extensionCategoriesCatalog"), adminData.extensionCategories.data?.length ?? 0],
            ["blockTypes", Shapes, t("blockTypesCatalog"), adminData.blockTypes.data?.length ?? 0],
            ["blockStatuses", CircleDot, t("blockStatusesCatalog"), adminData.blockStatuses.data?.length ?? 0],
            ["dataTypes", Database, "Tipos de dato", adminData.dataTypes.data?.length ?? 0],
            ["blockShapes", Layers3, t("shapesCatalog"), adminData.blockShapes.data?.length ?? 0],
            ["connectionTypes", Cable, t("connectionTypesCatalog"), adminData.connectionTypes.data?.length ?? 0],
            ["blockConnections", Settings2, t("blockConnectionsCatalog"), adminData.blockConnections.data?.length ?? 0],
            ["blockPlates", Server, t("blockPlatesCatalog"), adminData.blockPlates.data?.length ?? 0],
            ["extensionStatuses", CircleDot, t("extensionStatusesCatalog"), adminData.extensionStatuses.data?.length ?? 0],
          ].map(([panel, Icon, label, count]) => {
            const panelKey = panel as PanelKey;
            const MenuIcon = Icon as typeof Puzzle;
            return <button key={panelKey} type="button" className={activePanel === panelKey ? "active" : ""} onClick={() => setActivePanel(panelKey)}>
              <MenuIcon size={17} /><span>{label as string}</span><b>{count as number}</b><ChevronRight size={15} />
            </button>;
          })}
        </nav>
        <button type="button" className="extension-sidebar-back" onClick={onBack}>{t("backEditor")}</button>
      </aside>
      <section className="extension-form-card">
        <div className="extension-form-header">
          <div>
            <span>{t("extensionManagement")}</span>
            <h1>{editingExtensionId ? t("editExtension") : t("createExtension")}</h1>
          </div>
          <button type="button" className="extension-secondary-btn" onClick={onBack}>
            Volver al editor
          </button>
        </div>
        <QueryFreshness updatedAt={freshness.updatedAt} isFetching={freshness.isFetching} label={`Última obtención: ${freshness.title}`} />

        {activePanel === "extensions" ? <>
          <div className="extension-list" aria-live="polite">
            <div className="extension-list-heading">
              <strong>Extensiones registradas</strong>
              <span>{extensions.length}</span>
            </div>
            {adminData.extensions.isLoading && <p>Cargando extensiones...</p>}
            {adminData.extensions.isError && <p>No se pudieron cargar las extensiones.</p>}
            {extensions.map((extension) => (
            <article className="extension-list-item" key={extension.id_extension}>
              <div>
                <strong>{extension.nombre}</strong>
                <span>{extension.descripcion || "Sin descripción"}</span>
              </div>
              <div className="extension-list-actions"><small>{extension.version} · {extension.estado?.nombre ?? "Sin estado"}</small><button type="button" onClick={() => { setEditingExtensionId(extension.id_extension); setNombre(extension.nombre); setDescripcion(extension.descripcion ?? ""); setVersion(extension.version); setEstadoId(extension.id_estado_extension); }}>Editar</button></div>
            </article>
            ))}
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
              <label htmlFor="extension-status">Estado</label>
              <select
                id="extension-status"
                value={estadoId}
                onChange={(event) => setEstadoId(event.target.value)}
                disabled={isSubmitting}
              >
                <option value="">Selecciona un estado</option>
                {uniqueStatuses.map((status) => (
                  <option key={status.id_estado_extension} value={status.id_estado_extension}>
                    {status.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button type="submit" className="extension-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Guardando..." : editingExtensionId ? "Guardar cambios" : "Crear extensión"}
          </button>
          </form>
        </> : activePanel === "blocks" ? <>
          <div className="extension-list" aria-live="polite">
            <div className="extension-list-heading"><strong>Bloques registrados</strong><span>{adminData.blocks.data?.length ?? 0}</span></div>
            {adminData.blocks.isLoading && <p>Cargando bloques...</p>}
            {(adminData.blocks.data ?? []).map((block) => (
              <article className="extension-list-item" key={block.id_bloque}>
                <div><strong>{block.nombre}</strong><span>{block.extension?.nombre ?? "Sin extensión"}</span></div>
                <div className="extension-list-actions"><small>Orden {block.orden} · {block.tipo?.nombre ?? "Sin tipo"}</small><button type="button" onClick={() => { setEditingBlockId(block.id_bloque); setBlockName(block.nombre); setBlockDescription(block.descripcion ?? ""); setBlockOrder(String(block.orden)); setBlockExtensionId(block.id_extension); setBlockTypeId(block.id_tipo_bloque); setBlockStatusId(block.id_estado_bloque); }}>Editar</button></div>
              </article>
            ))}
          </div>
          <form className="extension-form" onSubmit={handleBlockSubmit}>
            <label htmlFor="block-name">Nombre del bloque</label>
            <input id="block-name" value={blockName} onChange={(event) => setBlockName(event.target.value)} placeholder="Leer sensor" disabled={isSubmitting} />
            <label htmlFor="block-description">Descripción</label>
            <textarea id="block-description" value={blockDescription} onChange={(event) => setBlockDescription(event.target.value)} placeholder="Describe el comportamiento del bloque" disabled={isSubmitting} />
            <div className="extension-form-grid">
              <div><label htmlFor="block-extension">Extensión</label><select id="block-extension" value={blockExtensionId} onChange={(event) => setBlockExtensionId(event.target.value)} disabled={isSubmitting}><option value="">Selecciona una extensión</option>{extensions.map((item) => <option key={item.id_extension} value={item.id_extension}>{item.nombre}</option>)}</select></div>
              <div><label htmlFor="block-type">Tipo de bloque</label><select id="block-type" value={blockTypeId} onChange={(event) => setBlockTypeId(event.target.value)} disabled={isSubmitting}><option value="">Selecciona un tipo</option>{(adminData.blockTypes.data ?? []).map((item) => <option key={item.id_tipo_bloque} value={item.id_tipo_bloque}>{item.nombre}</option>)}</select></div>
              <div><label htmlFor="block-status">Estado</label><select id="block-status" value={blockStatusId} onChange={(event) => setBlockStatusId(event.target.value)} disabled={isSubmitting}><option value="">Selecciona un estado</option>{(adminData.blockStatuses.data ?? []).map((item) => <option key={item.id_estado_bloque} value={item.id_estado_bloque}>{item.nombre}</option>)}</select></div>
              <div><label htmlFor="block-order">Orden</label><input id="block-order" type="number" min="1" value={blockOrder} onChange={(event) => setBlockOrder(event.target.value)} disabled={isSubmitting} /></div>
            </div>
            <button type="submit" className="extension-submit-btn" disabled={isSubmitting}>{isSubmitting ? "Creando..." : "Crear bloque"}</button>
          </form>
        </> : activePanel === "parameters" ? <>
          <div className="extension-panel-intro"><span>Configuración</span><h2>Parámetros</h2><p>Consulta los parámetros que alimentan tus bloques personalizados.</p></div>
          <div className="extension-list" aria-live="polite">
            {(adminData.parameters.data ?? []).map((parameter) => <article className="extension-list-item" key={parameter.id_parametro_bloque}><div><strong>{parameter.etiqueta || parameter.nombre}</strong><span>{parameter.nombre} · {parameter.tipo_dato?.nombre ?? "Tipo no definido"}</span></div><small>{parameter.requerido ? "Requerido" : "Opcional"} · Orden {parameter.orden}</small></article>)}
            {!adminData.parameters.isLoading && !(adminData.parameters.data ?? []).length && <p>No hay parámetros registrados.</p>}
          </div>
        </> : activePanel === "options" ? <>
          <div className="extension-panel-intro"><span>Configuración</span><h2>Opciones de parámetros</h2><p>Valores disponibles para seleccionar desde los bloques.</p></div>
          <div className="extension-list" aria-live="polite">
            {(adminData.options.data ?? []).map((option) => <article className="extension-list-item" key={option.id_opcion_parametro}><div><strong>{option.etiqueta}</strong><span>Valor: {String(option.valor)}</span></div><small>{option.activo ? "Activa" : "Inactiva"} · Orden {option.orden}</small></article>)}
            {!adminData.options.isLoading && !(adminData.options.data ?? []).length && <p>No hay opciones registradas.</p>}
          </div>
        </> : (() => {
          const view = catalogViews[activePanel];
          return <>
            <div className="extension-panel-intro"><span>Catálogo</span><h2>{view.title}</h2><p>{view.description}</p></div>
            <div className="extension-list" aria-live="polite">
              {view.loading && <p>Cargando datos...</p>}
              {view.data.map((item, index) => <article className="extension-list-item" key={String(item.id ?? item.id_placa ?? item.id_categoria ?? index)}><div><strong>{String(item.nombre ?? item.etiqueta ?? item.message ?? "Registro")}</strong><span>{String(item.descripcion ?? item.color ?? item.valor ?? "Configuración del sistema")}</span></div><small>{item.activo === false ? "Inactivo" : "Activo"}</small></article>)}
              {!view.loading && !view.data.length && <p>No hay registros en esta sección.</p>}
            </div>
          </>;
        })()}
      </section>
      </div>
    </main>
  );
}
