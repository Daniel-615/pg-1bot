import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Permiso } from "../../services/permiso.service";
import { useCreatePermiso } from "../../hooks/permisos/createPermisoHook";
import { useDeletePermiso } from "../../hooks/permisos/deletePermiso.Hook";
import { usePermisos } from "../../hooks/permisos/permisosHook";
import { useUpdatePermiso } from "../../hooks/permisos/updatePermisoHook";
import { ArrowLeft, Edit2, Plus, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as {
            message?: unknown;
            error?: unknown;
            errors?: unknown;
        } | undefined;

        if (typeof data?.message === "string" && data.message.trim()) {
            return data.message;
        }

        if (typeof data?.error === "string" && data.error.trim()) {
            return data.error;
        }

        if (Array.isArray(data?.errors)) {
            const messages = data.errors.filter((item): item is string => typeof item === "string");
            if (messages.length > 0) {
                return messages.join(". ");
            }
        }
    }

    return error instanceof Error ? error.message : fallback;
}

function formatDate(value?: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit",
    }).format(date);
}

function PermisoScreen() {
    const [permisoEditando, setPermisoEditando] = useState<Permiso | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [nombreEditado, setNombreEditado] = useState("");
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [idBusqueda, setIdBusqueda] = useState("");
    const navigate = useNavigate();

    const permisosQuery = usePermisos(page, limit);
    const permisosCatalogQuery = usePermisos(1, 100);
    const createPermisoMutation = useCreatePermiso();
    const updatePermisoMutation = useUpdatePermiso();
    const deletePermisoMutation = useDeletePermiso();

    const permisosResponse = permisosQuery.data;
    const permisos = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.rows : [];
    const total = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.total : 0;
    const totalPages = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.totalPages || 1 : 1;
    const permisosCatalogData = permisosCatalogQuery.data?.ok ? permisosCatalogQuery.data.data : undefined;
    const permisosCatalog = Array.isArray(permisosCatalogData) ? permisosCatalogData : permisosCatalogData?.rows ?? [];

    const handleCrearPermiso = async () => {
        if (!nombreNuevo.trim()) {
            toast.error("El nombre del permiso no puede estar vacío");
            return;
        }

        try {
            const response = await createPermisoMutation.mutateAsync({ nombre: nombreNuevo });

            if (response.ok) {
                toast.success("Permiso creado correctamente");
                setNombreNuevo("");
                if (page !== 1) {
                    setPage(1);
                }
            } else {
                toast.error(response.message || "Error al crear el permiso");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al crear el permiso"));
        }
    };

    const handleGuardarEdicion = async () => {
        if (!permisoEditando?.id) return;

        try {
            const response = await updatePermisoMutation.mutateAsync({
                id: permisoEditando.id,
                data: { nombre: nombreEditado },
            });

            if (response.ok) {
                toast.success("Permiso actualizado");
                setPermisoEditando(null);
            } else {
                toast.error(response.message || "Error al actualizar el permiso");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al actualizar el permiso"));
        }
    };

    const handleEliminar = async (id?: number) => {
        if (!id) return;
        if (!window.confirm("¿Está seguro de eliminar este permiso?")) return;

        try {
            const response = await deletePermisoMutation.mutateAsync(id);

            if (response.ok) {
                toast.success("Permiso eliminado correctamente");
                if (permisos.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                toast.error(response.message || "Error al eliminar el permiso");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al eliminar el permiso"));
        }
    };

    useEffect(() => {
        if (permisosResponse && !permisosResponse.ok) {
            toast.error(permisosResponse.message || "Error al cargar los permisos");
        }
    }, [permisosResponse]);

    useEffect(() => {
        if (permisosQuery.error) {
            toast.error(getErrorMessage(permisosQuery.error, "Error al cargar los permisos"));
        }
    }, [permisosQuery.error]);

    const primerPermiso = total === 0 ? 0 : (page - 1) * limit + 1;
    const ultimoPermiso = Math.min(page * limit, total);
    const permisosDeTabla = idBusqueda
        ? permisosCatalog.filter((permiso) => String(permiso.id) === idBusqueda)
        : permisos;

    return (
        <div className="rol-container">
            <main className="rol-content">
                <header className="rol-header">
                    <button onClick={() => navigate("/dashboard")} className="rol-back">
                        <ArrowLeft size={22} />
                    </button>

                    <div className="rol-title">
                        <h1>Gestión de Permisos</h1>
                        <p>Administra los permisos disponibles dentro del sistema.</p>
                        <QueryFreshness updatedAt={permisosQuery.dataUpdatedAt} isFetching={permisosQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        Crear Nuevo Permiso
                    </h2>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">Nombre del permiso <b aria-hidden="true">*</b></span>
                            <input type="text" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} className="rol-input" placeholder="Ej. leer_usuarios" />
                        </label>

                        <button onClick={handleCrearPermiso} className="rol-button">
                            Crear
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                        Buscar permiso
                    </h2>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">Permiso <b aria-hidden="true">*</b></span>
                            <select value={idBusqueda} onChange={(e) => { setIdBusqueda(e.target.value); setPage(1); }} className="rol-input rol-select">
                                <option value="">Selecciona un permiso</option>
                                {permisosCatalog.map((permiso) => <option key={permiso.id} value={permiso.id}>{permiso.nombre} (ID: {permiso.id})</option>)}
                            </select>
                        </label>
                        {idBusqueda && <button type="button" onClick={() => setIdBusqueda("")} className="rol-button rol-cancel">Ver todos</button>}
                    </div>
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Creado</th>
                                <th>Actualizado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {permisosDeTabla.length > 0 ? (
                                permisosDeTabla.map((permiso) => (
                                    <tr key={permiso.id}>
                                        <td>{permiso.id}</td>
                                        <td>{permiso.nombre}</td>
                                        <td className="rol-date-cell">{formatDate(permiso.createdAt)}</td>
                                        <td className="rol-date-cell">{formatDate(permiso.updatedAt)}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() => {
                                                        setPermisoEditando(permiso);
                                                        setNombreEditado(permiso.nombre);
                                                    }}
                                                    className="rol-edit"
                                                >
                                                    <Edit2 size={15} />
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => handleEliminar(permiso.id)}
                                                    className="rol-delete"
                                                >
                                                    <Trash2 size={15} />
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="rol-empty">
                                        {idBusqueda ? "No se encontró el permiso seleccionado." : "No hay permisos disponibles."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        {idBusqueda ? "Mostrando 1 permiso" : `Mostrando ${primerPermiso} - ${ultimoPermiso} de ${total} permisos`}
                    </p>

                    {!idBusqueda && <div className="rol-pagination-controls">
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="rol-select"
                        >
                            <option value={5}>5 por página</option>
                            <option value={10}>10 por página</option>
                            <option value={20}>20 por página</option>
                            <option value={50}>50 por página</option>
                        </select>

                        <button
                            onClick={() => setPage((currentPage) => currentPage - 1)}
                            className="rol-button rol-pagination-button"
                            disabled={page <= 1}
                        >
                            Anterior
                        </button>

                        <span className="rol-page-indicator">
                            Página {page} de {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((currentPage) => currentPage + 1)}
                            className="rol-button rol-pagination-button"
                            disabled={page >= totalPages}
                        >
                            Siguiente
                        </button>
                    </div>}
                </section>

                {permisoEditando && (
                    <section className="rol-modal">
                        <h2>
                            <Edit2 size={20} />
                            Editar Permiso
                        </h2>

                        <input
                            type="text"
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="rol-input"
                            placeholder="Nombre del permiso"
                        />

                        <div className="rol-modal-buttons">
                            <button onClick={handleGuardarEdicion} className="rol-button">
                                Guardar
                            </button>

                            <button
                                onClick={() => setPermisoEditando(null)}
                                className="rol-button rol-cancel"
                            >
                                Cancelar
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default PermisoScreen;
