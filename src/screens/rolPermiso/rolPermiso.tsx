import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createRolPermiso,
    deleteRolPermiso,
    getRolPermisoById,
    getRolPermisos,
    type RolPermiso,
} from "../../services/rol.permiso.service";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import "../../styles/rol.css";

function RolPermisoScreen() {
    const [relaciones, setRelaciones] = useState<RolPermiso[]>([]);
    const [relacionBuscada, setRelacionBuscada] = useState<RolPermiso | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [serverPaginated, setServerPaginated] = useState(false);
    const [rolIdNuevo, setRolIdNuevo] = useState("");
    const [permisoIdNuevo, setPermisoIdNuevo] = useState("");
    const [rolIdBusqueda, setRolIdBusqueda] = useState("");
    const [permisoIdBusqueda, setPermisoIdBusqueda] = useState("");
    const navigate = useNavigate();

    const cargarRelaciones = async (nextPage = page, nextLimit = limit) => {
        const response = await getRolPermisos(nextPage, nextLimit);

        if ((response.ok || response.success) && response.data) {
            const pagination = normalizePagination<RolPermiso>(response.data, response, nextPage, nextLimit);

            setRelaciones(pagination.rows);
            setPage(pagination.page);
            setTotal(pagination.total);
            setTotalPages(pagination.totalPages);
            setServerPaginated(pagination.serverPaginated);
        } else {
            toast.error(response.message || "Error al cargar las relaciones rol-permiso");
        }
    };

    const handleCrearRelacion = async () => {
        const rolId = Number(rolIdNuevo);
        const permisoId = Number(permisoIdNuevo);

        if (!rolId || !permisoId) {
            toast.error("Ingresa un ID de rol y un ID de permiso válidos");
            return;
        }

        const response = await createRolPermiso({ rolId, permisoId });

        if (response.ok || response.success) {
            toast.success("Permiso asignado al rol correctamente");
            setRolIdNuevo("");
            setPermisoIdNuevo("");
            if (page === 1) {
                cargarRelaciones(1, limit);
            } else {
                setPage(1);
            }
        } else {
            toast.error(response.message || "Error al asignar el permiso al rol");
        }
    };

    const handleBuscarRelacion = async () => {
        if (!rolIdBusqueda.trim() || !permisoIdBusqueda.trim()) {
            toast.error("Ingresa el ID del rol y el ID del permiso para buscar");
            return;
        }

        const response = await getRolPermisoById(rolIdBusqueda, permisoIdBusqueda);

        if ((response.ok || response.success) && response.data) {
            setRelacionBuscada(response.data);
        } else {
            setRelacionBuscada(null);
            toast.error(response.message || "Relación rol-permiso no encontrada");
        }
    };

    const handleEliminar = async (rolId: number, permisoId: number) => {
        if (!window.confirm("¿Está seguro de eliminar esta relación rol-permiso?")) return;

        const response = await deleteRolPermiso(rolId, permisoId);

        if (response.ok || response.success) {
            toast.success("Relación eliminada correctamente");
            if (relacionesVisibles.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                cargarRelaciones(page, limit);
            }
        } else {
            toast.error(response.message || "Error al eliminar la relación rol-permiso");
        }
    };

    useEffect(() => {
        void getRolPermisos(page, limit).then((response) => {
            if ((response.ok || response.success) && response.data) {
                const pagination = normalizePagination<RolPermiso>(response.data, response, page, limit);

                setRelaciones(pagination.rows);
                setPage(pagination.page);
                setTotal(pagination.total);
                setTotalPages(pagination.totalPages);
                setServerPaginated(pagination.serverPaginated);
            } else {
                toast.error(response.message || "Error al cargar las relaciones rol-permiso");
            }
        });
    }, [page, limit]);

    const relacionesVisibles = paginateRows(relaciones, page, limit, serverPaginated);
    const { first: primeraRelacion, last: ultimaRelacion } = getPaginationRange(total, page, limit);

    return (
        <div className="rol-container">
            <main className="rol-content">
                <header className="rol-header">
                    <button onClick={() => navigate("/dashboard")} className="rol-back">
                        <ArrowLeft size={22} />
                    </button>

                    <div className="rol-title">
                        <h1>Gestión de Rol Permiso</h1>
                        <p>Asigna y consulta permisos relacionados con cada rol.</p>
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        Crear Relación Rol-Permiso
                    </h2>

                    <div className="rol-form">
                        <input
                            type="number"
                            value={rolIdNuevo}
                            onChange={(e) => setRolIdNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="ID del rol"
                        />

                        <input
                            type="number"
                            value={permisoIdNuevo}
                            onChange={(e) => setPermisoIdNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="ID del permiso"
                        />

                        <button onClick={handleCrearRelacion} className="rol-button">
                            Crear
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                        Buscar Relación por IDs
                    </h2>

                    <div className="rol-form">
                        <input
                            type="number"
                            value={rolIdBusqueda}
                            onChange={(e) => setRolIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del rol"
                        />

                        <input
                            type="number"
                            value={permisoIdBusqueda}
                            onChange={(e) => setPermisoIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del permiso"
                        />

                        <button onClick={handleBuscarRelacion} className="rol-button">
                            Buscar
                        </button>
                    </div>

                    {relacionBuscada && (
                        <div className="rol-result">
                            <strong>Rol:</strong> {relacionBuscada.rol?.nombre || relacionBuscada.rolId} |{" "}
                            <strong>Permiso:</strong>{" "}
                            {relacionBuscada.permiso?.nombre || relacionBuscada.permisoId}
                        </div>
                    )}
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Rol ID</th>
                                <th>Rol</th>
                                <th>Permiso ID</th>
                                <th>Permiso</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {relacionesVisibles.length > 0 ? (
                                relacionesVisibles.map((relacion) => (
                                    <tr key={`${relacion.rolId}-${relacion.permisoId}`}>
                                        <td>{relacion.rolId}</td>
                                        <td>{relacion.rol?.nombre || "-"}</td>
                                        <td>{relacion.permisoId}</td>
                                        <td>{relacion.permiso?.nombre || "-"}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() =>
                                                        handleEliminar(relacion.rolId, relacion.permisoId)
                                                    }
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
                                        No hay relaciones rol-permiso disponibles.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        Mostrando {primeraRelacion} - {ultimaRelacion} de {total} relaciones
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
            </main>
        </div>
    );
}

export default RolPermisoScreen;
