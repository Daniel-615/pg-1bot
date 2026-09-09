import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Rol } from "../../services/rol.service";
import { useCreateRol, useDeleteRol, useRoles, useUpdateRol } from "../../hooks/roles/rolesHook";
import { ArrowLeft, Edit2, GraduationCap, Layers3, Plus, Search, ShieldCheck, Trash2, UserRound } from "lucide-react";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
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

function getRoleIcon(roleName: string) {
    const role = roleName.trim().toLowerCase().replace(/\s+/g, "");

    if (role === "1botpersonal") return UserRound;
    if (role === "estudiante") return GraduationCap;
    return ShieldCheck;
}

function RolScreen() {
    const [rolEditando, setRolEditando] = useState<Rol | null>(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [nombreEditado, setNombreEditado] = useState("");
    const [nombreNuevo, setNombreNuevo] = useState("");
    const [idBusqueda, setIdBusqueda] = useState("");

    const navigate = useNavigate();

    const rolesQuery = useRoles(page, limit);
    const rolesCatalogQuery = useRoles(1, 100);
    const createRolMutation = useCreateRol();
    const updateRolMutation = useUpdateRol();
    const deleteRolMutation = useDeleteRol();

    const rolesResponse = rolesQuery.data;
    const pagination = rolesResponse?.ok
        ? normalizePagination<Rol>(rolesResponse.data, rolesResponse, page, limit)
        : normalizePagination<Rol>(undefined, {}, page, limit);
    const roles = pagination.rows;
    const rolesCatalogData = rolesCatalogQuery.data?.ok ? rolesCatalogQuery.data.data : undefined;
    const rolesCatalog = Array.isArray(rolesCatalogData) ? rolesCatalogData : rolesCatalogData?.rows ?? [];
    const total = pagination.total;
    const totalPages = pagination.totalPages;
    const serverPaginated = pagination.serverPaginated;

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

    const rolesVisibles = paginateRows(roles, page, limit, serverPaginated);
    const rolesDeTabla = idBusqueda
        ? rolesCatalog.filter((rol) => String(rol.id) === idBusqueda)
        : rolesVisibles;
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
                        <span className="rol-eyebrow">Control de acceso</span>
                        <h1>Gestión de Roles</h1>
                        <p>Define quién puede acceder y qué puede hacer dentro del sistema.</p>
                        <QueryFreshness updatedAt={rolesQuery.dataUpdatedAt} isFetching={rolesQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-stats" aria-label="Resumen de roles">
                    <div className="rol-stat-card">
                        <span className="rol-stat-icon rol-stat-icon-purple"><Layers3 size={19} /></span>
                        <div><small>Roles registrados</small><strong>{total}</strong></div>
                    </div>
                    <div className="rol-stat-card">
                        <span className="rol-stat-icon rol-stat-icon-green"><ShieldCheck size={19} /></span>
                        <div><small>Estado del catálogo</small><strong>Activo</strong></div>
                    </div>
                </section>

                <section className="rol-card">
                        <h2>
                            <Plus size={20} />
                            Nuevo rol
                        </h2>
                        <p className="rol-card-description">Agrega un perfil para organizar los permisos del equipo.</p>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">Nombre del rol <b aria-hidden="true">*</b></span>
                            <input type="text" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} className="rol-input" placeholder="Ej. supervisor, editor..." />
                        </label>

                        <button onClick={handleCrearRol} className="rol-button">
                            Crear rol
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                            Buscar rol
                        </h2>
                        <p className="rol-card-description">Consulta rápidamente un rol específico por su identificador.</p>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">Rol <b aria-hidden="true">*</b></span>
                            <select value={idBusqueda} onChange={(e) => { setIdBusqueda(e.target.value); setPage(1); }} className="rol-input rol-select">
                                <option value="">Selecciona un rol</option>
                                {rolesCatalog.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre} (ID: {rol.id})</option>)}
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
                                        <th>Rol</th>
                                        <th>Creado</th>
                                        <th>Actualizado</th>
                                        <th>Acciones</th>
                            </tr>
                        </thead>

                        <tbody>
                            {rolesDeTabla.length > 0 ? (
                                rolesDeTabla.map((r) => (
                                    <tr key={r.id}>
                                        <td><span className="rol-id">#{r.id}</span></td>
                                        <td>
                                            <div className="rol-name-cell">
                                                <span className="rol-name-icon">
                                                    {(() => {
                                                        const RoleIcon = getRoleIcon(r.nombre);
                                                        return <RoleIcon size={16} />;
                                                    })()}
                                                </span>
                                                <strong>{r.nombre}</strong>
                                            </div>
                                        </td>
                                        <td className="rol-date-cell">{formatDate(r.createdAt)}</td>
                                        <td className="rol-date-cell">{formatDate(r.updatedAt)}</td>
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
                                    <td colSpan={5} className="rol-empty">
                                        {idBusqueda ? "No se encontró el rol seleccionado." : "No hay roles disponibles."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        {idBusqueda ? "Mostrando 1 rol" : `Mostrando ${primerRol} - ${ultimoRol} de ${total} roles`}
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
                            Página {page} de {Math.max(totalPages, 1)}
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
