import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Permiso } from "../../services/permiso.service";
import { useCreatePermiso } from "../../hooks/permisos/createPermisoHook";
import { useDeletePermiso } from "../../hooks/permisos/deletePermiso.Hook";
import { usePermiso } from "../../hooks/permisos/permisoGetByIdHook";
import { usePermisos } from "../../hooks/permisos/permisosHook";
import { useUpdatePermiso } from "../../hooks/permisos/updatePermisoHook";
import { ArrowLeft, Edit2, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function PermisoScreen() {
    const [permisoEditando, setPermisoEditando] = useState<Permiso | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [nombreEditado, setNombreEditado] = useState("");
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [idBusqueda, setIdBusqueda] = useState("");
    const [idPermisoBuscado, setIdPermisoBuscado] = useState<string | null>(null);
    const navigate = useNavigate();

    const permisosQuery = usePermisos(page, limit);
    const permisoBuscadoQuery = usePermiso(idPermisoBuscado);
    const createPermisoMutation = useCreatePermiso();
    const updatePermisoMutation = useUpdatePermiso();
    const deletePermisoMutation = useDeletePermiso();

    const permisosResponse = permisosQuery.data;
    const permisos = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.rows : [];
    const total = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.total : 0;
    const totalPages = permisosResponse?.ok && permisosResponse.data ? permisosResponse.data.totalPages || 1 : 1;
    const permisoBuscadoResponse = permisoBuscadoQuery.data;
    const permisoBuscado = permisoBuscadoResponse?.ok
        ? permisoBuscadoResponse.data || permisoBuscadoResponse.permiso || null
        : null;

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

    const handleBuscarPermiso = async () => {
        if (!idBusqueda.trim()) {
            toast.error("Ingresa un ID de permiso para buscar");
            return;
        }

        const nextId = idBusqueda.trim();

        if (idPermisoBuscado === nextId && permisoBuscadoQuery.data) {
            const permiso = permisoBuscadoQuery.data.data || permisoBuscadoQuery.data.permiso || null;

            if (!permisoBuscadoQuery.data.ok || !permiso) {
                toast.error(permisoBuscadoQuery.data.message || "Permiso no encontrado");
            }
        } else {
            setIdPermisoBuscado(nextId);
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

    useEffect(() => {
        const response = permisoBuscadoResponse;

        if (!idPermisoBuscado || !response) return;

        const permiso = response.data || response.permiso || null;

        if (!response.ok || !permiso) {
            toast.error(response.message || "Permiso no encontrado");
        }
    }, [idPermisoBuscado, permisoBuscadoResponse]);

    useEffect(() => {
        if (permisoBuscadoQuery.error) {
            toast.error(getErrorMessage(permisoBuscadoQuery.error, "Permiso no encontrado"));
        }
    }, [permisoBuscadoQuery.error]);

    const primerPermiso = total === 0 ? 0 : (page - 1) * limit + 1;
    const ultimoPermiso = Math.min(page * limit, total);

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
                        <input
                            type="text"
                            value={nombreNuevo}
                            onChange={(e) => setNombreNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="Nombre del permiso"
                        />

                        <button onClick={handleCrearPermiso} className="rol-button">
                            Crear
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                        Buscar Permiso por ID
                    </h2>

                    <div className="rol-form">
                        <input
                            type="number"
                            value={idBusqueda}
                            onChange={(e) => setIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del permiso"
                        />

                        <button onClick={handleBuscarPermiso} className="rol-button">
                            Buscar
                        </button>
                    </div>

                    {permisoBuscado && (
                        <div className="rol-result">
                            <strong>ID:</strong> {permisoBuscado.id} | <strong>Nombre:</strong>{" "}
                            {permisoBuscado.nombre}
                        </div>
                    )}
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Nombre</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {permisos.length > 0 ? (
                                permisos.map((permiso) => (
                                    <tr key={permiso.id}>
                                        <td>{permiso.id}</td>
                                        <td>{permiso.nombre}</td>
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
                                    <td colSpan={3} className="rol-empty">
                                        No hay permisos disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        Mostrando {primerPermiso} - {ultimoPermiso} de {total} permisos
                    </p>

                    <div className="rol-pagination-controls">
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
                    </div>
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
