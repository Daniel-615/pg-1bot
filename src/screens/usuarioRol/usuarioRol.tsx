import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { Usuario } from "../../services/usuario.service";
import type { UsuarioRol } from "../../services/usuario.rol.sevice";
import {
    useCreateUsuarioRol,
    useDeleteUsuarioRol,
    useUsuarioRoles,
} from "../../hooks/usuarioRoles/usuarioRolesHook";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import { QueryFreshness } from "../components/QueryFreshness";
import { useUsuarios } from "../../hooks/usuarios/usuariosHook";
import { useRoles } from "../../hooks/roles/rolesHook";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as { message?: unknown; error?: unknown; errors?: unknown } | undefined;
        if (typeof data?.message === "string" && data.message.trim()) return data.message;
        if (typeof data?.error === "string" && data.error.trim()) return data.error;
        if (Array.isArray(data?.errors)) {
            const messages = data.errors.filter((item): item is string => typeof item === "string");
            if (messages.length > 0) return messages.join(". ");
        }
    }

    return error instanceof Error ? error.message : fallback;
}

function extractUsuarios(payload: unknown): Usuario[] {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const response = payload as { data?: unknown; usuarios?: unknown; users?: unknown; rows?: unknown };
    if (Array.isArray(response.data)) return response.data;
    if (response.data && typeof response.data === "object" && "rows" in response.data) {
        const rows = (response.data as { rows?: unknown }).rows;
        if (Array.isArray(rows)) return rows;
    }
    if (Array.isArray(response.usuarios)) return response.usuarios;
    if (Array.isArray(response.users)) return response.users;
    if (Array.isArray(response.rows)) return response.rows;
    return [];
}

function getUsuarioLabel(usuario: Usuario) {
    const nombre = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim();
    return nombre || usuario.email || "Usuario sin nombre";
}

function formatDate(value?: string) {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return new Intl.DateTimeFormat("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

function UsuarioRolScreen() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [usuarioIdNuevo, setUsuarioIdNuevo] = useState("");
    const [rolIdNuevo, setRolIdNuevo] = useState("");
    const [usuarioIdBusqueda, setUsuarioIdBusqueda] = useState("");
    const navigate = useNavigate();

    const relacionesQuery = useUsuarioRoles(page, limit);
    const usuariosQuery = useUsuarios("todos");
    const rolesQuery = useRoles(1, 100);
    const createRelacionMutation = useCreateUsuarioRol();
    const deleteRelacionMutation = useDeleteUsuarioRol();

    const relacionesResponse = relacionesQuery.data;
    const pagination = relacionesResponse?.ok
        ? normalizePagination<UsuarioRol>(relacionesResponse.data, relacionesResponse, page, limit)
        : normalizePagination<UsuarioRol>(undefined, {}, page, limit);
    const relaciones = pagination.rows;
    const total = pagination.total;
    const totalPages = pagination.totalPages;
    const serverPaginated = pagination.serverPaginated;
    const usuarios = extractUsuarios(usuariosQuery.data);
    const rolesData = rolesQuery.data?.ok ? rolesQuery.data.data : undefined;
    const roles = Array.isArray(rolesData) ? rolesData : rolesData?.rows ?? [];

    const handleCrearRelacion = async () => {
        const rolId = Number(rolIdNuevo);

        if (!usuarioIdNuevo.trim() || !rolId) {
            toast.error(t("selectUserAndRole"));
            return;
        }

        try {
            const response = await createRelacionMutation.mutateAsync({ usuarioId: usuarioIdNuevo, rolId });

            if (response.ok) {
                toast.success(t("userRoleCreated"));
                setUsuarioIdNuevo("");
                setRolIdNuevo("");
                if (page !== 1) {
                    setPage(1);
                }
            } else {
                toast.error(response.message || t("userRoleCreated"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("userRoleCreated")));
        }
    };

    const handleEliminar = async (usuarioId: string, rolId: number) => {
        if (!window.confirm(t("confirmDeleteUserRole"))) return;

        try {
            const response = await deleteRelacionMutation.mutateAsync({ usuarioId, rolId });

            if (response.ok) {
                toast.success(t("relationshipDeleted"));
                if (relacionesVisibles.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                toast.error(response.message || t("relationshipDeleted"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("relationshipDeleted")));
        }
    };

    useEffect(() => {
        if (relacionesResponse && !relacionesResponse.ok) {
            toast.error(relacionesResponse.message || t("errorLoadUserRoles"));
        }
    }, [relacionesResponse]);

    useEffect(() => {
        if (relacionesQuery.error) {
            toast.error(getErrorMessage(relacionesQuery.error, t("errorLoadUserRoles")));
        }
    }, [relacionesQuery.error]);

    const relacionesVisibles = paginateRows(relaciones, page, limit, serverPaginated);
    const relacionesDeTabla = usuarioIdBusqueda
        ? relaciones.filter((relacion) => relacion.usuarioId === usuarioIdBusqueda)
        : relacionesVisibles;
    const { first: primeraRelacion, last: ultimaRelacion } = getPaginationRange(total, page, limit);

    return (
        <div className="rol-container">
            <main className="rol-content">
                <header className="rol-header">
                    <button onClick={() => navigate("/dashboard")} className="rol-back">
                        <ArrowLeft size={22} />
                    </button>

                    <div className="rol-title">
                        <h1>{t("userRoleTitle")}</h1>
                        <p>{t("userRoleDescription")}</p>
                        <QueryFreshness updatedAt={relacionesQuery.dataUpdatedAt} isFetching={relacionesQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        {t("assignRole")}
                    </h2>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("users")}</span>
                            <select
                                value={usuarioIdNuevo}
                                onChange={(e) => {
                                    setUsuarioIdNuevo(e.target.value);
                                    setRolIdNuevo("");
                                }}
                                className="rol-input rol-select"
                            >
                                <option value="">{t("selectUser")}</option>
                                {usuarios.map((usuario) => (
                                    <option key={String(usuario.id)} value={String(usuario.id)}>
                                        {getUsuarioLabel(usuario)} · {usuario.email || String(usuario.id)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="rol-field">
                            <span className="rol-field-label">{t("role")} <b aria-hidden="true">*</b></span>
                            <select
                            value={rolIdNuevo}
                            onChange={(e) => setRolIdNuevo(e.target.value)}
                            className="rol-input rol-select"
                            disabled={!usuarioIdNuevo}
                            >
                                <option value="">{t("selectRole")}</option>
                                {roles.map((rol) => (
                                    <option key={rol.id} value={rol.id}>{rol.nombre} (ID: {rol.id})</option>
                                ))}
                            </select>
                        </label>

                        <button onClick={handleCrearRelacion} className="rol-button" disabled={!usuarioIdNuevo || !rolIdNuevo}>
                            {t("create")}
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                        {t("searchUserRole")}
                    </h2>
                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("users")} <b aria-hidden="true">*</b></span>
                            <select
                                value={usuarioIdBusqueda}
                                onChange={(e) => {
                                    setUsuarioIdBusqueda(e.target.value);
                                    setPage(1);
                                }}
                                className="rol-input rol-select"
                            >
                                <option value="">{t("selectUser")}</option>
                                {usuarios.map((usuario) => (
                                    <option key={String(usuario.id)} value={String(usuario.id)}>
                                        {getUsuarioLabel(usuario)} · {usuario.email || String(usuario.id)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        {usuarioIdBusqueda && (
                            <button type="button" onClick={() => {
                                setUsuarioIdBusqueda("");
                            }} className="rol-button rol-cancel">
                                {t("viewAll")}
                            </button>
                        )}
                    </div>
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("users")} ID</th>
                                <th>{t("users")}</th>
                                <th>{t("email")}</th>
                                <th>{t("role")} ID</th>
                                <th>{t("role")}</th>
                                <th>{t("created")}</th>
                                <th>{t("updated")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {relacionesDeTabla.length > 0 ? (
                                relacionesDeTabla.map((relacion) => (
                                    <tr key={`${relacion.usuarioId}-${relacion.rolId}`}>
                                        <td>{relacion.usuarioId}</td>
                                        <td>{relacion.usuario?.nombre || "-"}</td>
                                        <td>{relacion.usuario?.email || "-"}</td>
                                        <td>{relacion.rolId}</td>
                                        <td>{relacion.rol?.nombre || "-"}</td>
                                        <td className="rol-date-cell">{formatDate(relacion.createdAt)}</td>
                                        <td className="rol-date-cell">{formatDate(relacion.updatedAt)}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() =>
                                                        handleEliminar(relacion.usuarioId, relacion.rolId)
                                                    }
                                                    className="rol-delete"
                                                >
                                                    <Trash2 size={15} />
                                                    {t("delete")}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={8} className="rol-empty">
                                         {usuarioIdBusqueda ? t("userHasNoRoles") : t("noUserRoles")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        {usuarioIdBusqueda
                             ? `${t("showing")} ${relacionesDeTabla.length} ${t("rolesPage")} ${t("of")} ${t("users").toLowerCase()}`
                             : `${t("showing")} ${primeraRelacion} - ${ultimaRelacion} ${t("of")} ${total} ${t("relationships")}`}
                    </p>

                    {!usuarioIdBusqueda && <div className="rol-pagination-controls">
                        <select
                            value={limit}
                            onChange={(e) => {
                                setLimit(Number(e.target.value));
                                setPage(1);
                            }}
                            className="rol-select"
                        >
                            <option value={5}>5 {t("perPage")}</option>
                            <option value={10}>10 {t("perPage")}</option>
                            <option value={20}>20 {t("perPage")}</option>
                            <option value={50}>50 {t("perPage")}</option>
                        </select>

                        <button
                            onClick={() => setPage((currentPage) => currentPage - 1)}
                            className="rol-button rol-pagination-button"
                            disabled={page <= 1}
                        >
                            {t("previous")}
                        </button>

                        <span className="rol-page-indicator">
                            {t("page")} {page} {t("of")} {totalPages}
                        </span>

                        <button
                            onClick={() => setPage((currentPage) => currentPage + 1)}
                            className="rol-button rol-pagination-button"
                            disabled={page >= totalPages}
                        >
                            {t("next")}
                        </button>
                    </div>}
                </section>
            </main>
        </div>
    );
}

export default UsuarioRolScreen;
