import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    createUsuarioRol,
    deleteUsuarioRol,
    getUsuarioRolById,
    getUsuarioRoles,
    type UsuarioRol,
} from "../../api/usuario.rol";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import "../rol/rol.css";

function UsuarioRolScreen() {
    const [relaciones, setRelaciones] = useState<UsuarioRol[]>([]);
    const [relacionBuscada, setRelacionBuscada] = useState<UsuarioRol | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const [serverPaginated, setServerPaginated] = useState(false);
    const [usuarioIdNuevo, setUsuarioIdNuevo] = useState("");
    const [rolIdNuevo, setRolIdNuevo] = useState("");
    const [usuarioIdBusqueda, setUsuarioIdBusqueda] = useState("");
    const [rolIdBusqueda, setRolIdBusqueda] = useState("");
    const navigate = useNavigate();

    const cargarRelaciones = async (nextPage = page, nextLimit = limit) => {
        const response = await getUsuarioRoles(nextPage, nextLimit);

        if (response.ok && response.data) {
            const pagination = normalizePagination<UsuarioRol>(response.data, response, nextPage, nextLimit);

            setRelaciones(pagination.rows);
            setPage(pagination.page);
            setTotal(pagination.total);
            setTotalPages(pagination.totalPages);
            setServerPaginated(pagination.serverPaginated);
        } else {
            toast.error(response.message || "Error al cargar las relaciones usuario-rol");
        }
    };

    const handleCrearRelacion = async () => {
        const rolId = Number(rolIdNuevo);

        if (!usuarioIdNuevo.trim() || !rolId) {
            toast.error("Ingresa un ID de usuario y un ID de rol válidos");
            return;
        }

        const response = await createUsuarioRol({ usuarioId: usuarioIdNuevo, rolId });

        if (response.ok) {
            toast.success("Rol asignado al usuario correctamente");
            setUsuarioIdNuevo("");
            setRolIdNuevo("");
            if (page === 1) {
                cargarRelaciones(1, limit);
            } else {
                setPage(1);
            }
        } else {
            toast.error(response.message || "Error al asignar el rol al usuario");
        }
    };

    const handleBuscarRelacion = async () => {
        if (!usuarioIdBusqueda.trim() || !rolIdBusqueda.trim()) {
            toast.error("Ingresa el ID del usuario y el ID del rol para buscar");
            return;
        }

        const response = await getUsuarioRolById(usuarioIdBusqueda, rolIdBusqueda);

        if (response.ok && response.data) {
            setRelacionBuscada(response.data);
        } else {
            setRelacionBuscada(null);
            toast.error(response.message || "Relación usuario-rol no encontrada");
        }
    };

    const handleEliminar = async (usuarioId: string, rolId: number) => {
        if (!window.confirm("¿Está seguro de eliminar esta relación usuario-rol?")) return;

        const response = await deleteUsuarioRol(usuarioId, rolId);

        if (response.ok) {
            toast.success("Relación eliminada correctamente");
            if (relacionesVisibles.length === 1 && page > 1) {
                setPage(page - 1);
            } else {
                cargarRelaciones(page, limit);
            }
        } else {
            toast.error(response.message || "Error al eliminar la relación usuario-rol");
        }
    };

    useEffect(() => {
        void getUsuarioRoles(page, limit).then((response) => {
            if (response.ok && response.data) {
                const pagination = normalizePagination<UsuarioRol>(response.data, response, page, limit);

                setRelaciones(pagination.rows);
                setPage(pagination.page);
                setTotal(pagination.total);
                setTotalPages(pagination.totalPages);
                setServerPaginated(pagination.serverPaginated);
            } else {
                toast.error(response.message || "Error al cargar las relaciones usuario-rol");
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
                        <h1>Gestión de Usuario Rol</h1>
                        <p>Asigna y consulta roles relacionados con cada usuario.</p>
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        Crear Relación Usuario-Rol
                    </h2>

                    <div className="rol-form">
                        <input
                            type="text"
                            value={usuarioIdNuevo}
                            onChange={(e) => setUsuarioIdNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="ID del usuario"
                        />

                        <input
                            type="number"
                            value={rolIdNuevo}
                            onChange={(e) => setRolIdNuevo(e.target.value)}
                            className="rol-input"
                            placeholder="ID del rol"
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
                            type="text"
                            value={usuarioIdBusqueda}
                            onChange={(e) => setUsuarioIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del usuario"
                        />

                        <input
                            type="number"
                            value={rolIdBusqueda}
                            onChange={(e) => setRolIdBusqueda(e.target.value)}
                            className="rol-input"
                            placeholder="ID del rol"
                        />

                        <button onClick={handleBuscarRelacion} className="rol-button">
                            Buscar
                        </button>
                    </div>

                    {relacionBuscada && (
                        <div className="rol-result">
                            <strong>Usuario:</strong>{" "}
                            {relacionBuscada.usuario?.email || relacionBuscada.usuarioId} |{" "}
                            <strong>Rol:</strong> {relacionBuscada.rol?.nombre || relacionBuscada.rolId}
                        </div>
                    )}
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>Usuario ID</th>
                                <th>Usuario</th>
                                <th>Email</th>
                                <th>Rol ID</th>
                                <th>Rol</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {relacionesVisibles.length > 0 ? (
                                relacionesVisibles.map((relacion) => (
                                    <tr key={`${relacion.usuarioId}-${relacion.rolId}`}>
                                        <td>{relacion.usuarioId}</td>
                                        <td>{relacion.usuario?.nombre || "-"}</td>
                                        <td>{relacion.usuario?.email || "-"}</td>
                                        <td>{relacion.rolId}</td>
                                        <td>{relacion.rol?.nombre || "-"}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() =>
                                                        handleEliminar(relacion.usuarioId, relacion.rolId)
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
                                    <td colSpan={6} className="rol-empty">
                                        No hay relaciones usuario-rol disponibles.
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

export default UsuarioRolScreen;
