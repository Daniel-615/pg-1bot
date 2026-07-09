import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Rol } from "../../services/rol.service";
import { useCreateRol, useDeleteRol, useRol, useRoles, useUpdateRol } from "../../hooks/roles/rolesHook";
import { ArrowLeft, Plus, Edit2, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
    return error instanceof Error ? error.message : fallback;
}

function RolScreen() {
    const [rolEditando, setRolEditando] = useState<Rol | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [nombreEditado, setNombreEditado] = useState("");
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [idBusqueda, setIdBusqueda] = useState("");
    const [idRolBuscado, setIdRolBuscado] = useState<string | null>(null);

    const navigate = useNavigate();

    const rolesQuery = useRoles(page, limit);
    const rolBuscadoQuery = useRol(idRolBuscado);
    const createRolMutation = useCreateRol();
    const updateRolMutation = useUpdateRol();
    const deleteRolMutation = useDeleteRol();

    const rolesResponse = rolesQuery.data;
    const pagination = rolesResponse?.ok
        ? normalizePagination<Rol>(rolesResponse.data, rolesResponse, page, limit)
        : normalizePagination<Rol>(undefined, {}, page, limit);
    const roles = pagination.rows;
    const total = pagination.total;
    const totalPages = pagination.totalPages;
    const serverPaginated = pagination.serverPaginated;
    const rolBuscadoResponse = rolBuscadoQuery.data;
    const rolBuscado = rolBuscadoResponse?.ok
        ? rolBuscadoResponse.data || rolBuscadoResponse.rol || null
        : null;

    const handleEliminar = async (id: string | number) => {
        if (!window.confirm("¿Está seguro de eliminar este rol?")) return;

        try {
            const response = await deleteRolMutation.mutateAsync(id);

            if (response.ok) {
                toast.success("Rol eliminado correctamente");
                if (!serverPaginated && rolesVisibles.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                toast.error(response.message || "Error al eliminar el rol");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al eliminar el rol"));
        }
    };

    const handleGuardarEdicion = async () => {
        if (!rolEditando?.id) return;

        try {
            const response = await updateRolMutation.mutateAsync({
                id: rolEditando.id,
                data: { nombre: nombreEditado },
            });

            if (response.ok) {
                toast.success("Rol actualizado");
                setRolEditando(null);
            } else {
                toast.error(response.message || "Error al actualizar el rol");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al actualizar el rol"));
        }
    };

    const handleCrearRol = async () => {
        if (!nombreNuevo.trim()) {
            toast.error("El nombre del rol no puede estar vacío");
            return;
        }

        try {
            const response = await createRolMutation.mutateAsync({ nombre: nombreNuevo });

            if (response.ok) {
                toast.success("Rol creado correctamente");
                setNombreNuevo("");
                if (page !== 1) {
                    setPage(1);
                }
            } else {
                toast.error(response.message || "Error al crear el rol");
            }
        } catch (error) {
            toast.error(getErrorMessage(error, "Error al crear el rol"));
        }
    };

    const handleBuscarRol = async () => {
        if (!idBusqueda.trim()) {
            toast.error("Ingresa un ID de rol para buscar");
            return;
        }

        const nextId = idBusqueda.trim();

        if (idRolBuscado === nextId && rolBuscadoQuery.data) {
            const rol = rolBuscadoQuery.data.data || rolBuscadoQuery.data.rol || null;

            if (!rolBuscadoQuery.data.ok || !rol) {
                toast.error(rolBuscadoQuery.data.message || "Rol no encontrado");
            }
        } else {
            setIdRolBuscado(nextId);
        }
    };

    useEffect(() => {
        if (rolesResponse && !rolesResponse.ok) {
            toast.error(rolesResponse.message || "Error al cargar los roles");
        }
    }, [rolesResponse]);

    useEffect(() => {
        if (rolesQuery.error) {
            toast.error(getErrorMessage(rolesQuery.error, "Error al cargar los roles"));
        }
    }, [rolesQuery.error]);

    useEffect(() => {
        const response = rolBuscadoResponse;

        if (!idRolBuscado || !response) return;

        const rol = response.data || response.rol || null;

        if (!response.ok || !rol) {
            toast.error(response.message || "Rol no encontrado");
        }
    }, [idRolBuscado, rolBuscadoResponse]);

    useEffect(() => {
        if (rolBuscadoQuery.error) {
            toast.error(getErrorMessage(rolBuscadoQuery.error, "Rol no encontrado"));
        }
    }, [rolBuscadoQuery.error]);

    const rolesVisibles = paginateRows(roles, page, limit, serverPaginated);
    const { first: primerRol, last: ultimoRol } = getPaginationRange(total, page, limit);

    return (
        <div className="rol-container">
            <main className="rol-content">
                <header className="rol-header">
                    <button
                        onClick={() => navigate("/dashboard")}
                        className="rol-back"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="rol-title">
                        <h1>Gestión de Roles</h1>
                        <p>Administra los roles disponibles dentro del sistema.</p>
                        <QueryFreshness updatedAt={rolesQuery.dataUpdatedAt} isFetching={rolesQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        Crear Nuevo Rol
                    </h2>

                    <div className="rol-form">
                        <input
                            type="text"
                            value={nombreNuevo}
                            onChange={(e) => setNombreNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="Nombre del rol"
                        />

                        <button onClick={handleCrearRol} className="rol-button">
                            Crear
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                        Buscar Rol por ID
                    </h2>

                    <div className="rol-form">
                        <input
                            type="number"
                            value={idBusqueda}
                            onChange={(e) => setIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del rol"
                        />

                        <button onClick={handleBuscarRol} className="rol-button">
                            Buscar
                        </button>
                    </div>

                    {rolBuscado && (
                        <div className="rol-result">
                            <strong>ID:</strong> {rolBuscado.id} | <strong>Nombre:</strong>{" "}
                            {rolBuscado.nombre}
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
                            {rolesVisibles.length > 0 ? (
                                rolesVisibles.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.nombre}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() => {
                                                        setRolEditando(r);
                                                        setNombreEditado(r.nombre);
                                                    }}
                                                    className="rol-edit"
                                                >
                                                    <Edit2 size={15} />
                                                    Editar
                                                </button>

                                                <button
                                                    onClick={() => handleEliminar(r.id)}
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
                                        No hay roles disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        Mostrando {primerRol} - {ultimoRol} de {total} roles
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

                {rolEditando && (
                    <section className="rol-modal">
                        <h2>
                            <Edit2 size={20} />
                            Editar Rol
                        </h2>

                        <input
                            type="text"
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="rol-input"
                            placeholder="Nombre del rol"
                        />

                        <div className="rol-modal-buttons">
                            <button onClick={handleGuardarEdicion} className="rol-button">
                                Guardar
                            </button>

                            <button
                                onClick={() => setRolEditando(null)}
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

export default RolScreen;
