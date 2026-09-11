import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import type { RolPermiso } from "../../services/rol.permiso.service";
import {
    useCreateRolPermiso,
    useDeleteRolPermiso,
    usePermisosNoAsignados,
    useRolPermiso,
    useRolPermisos,
} from "../../hooks/rolPermisos/rolPermisosHook";
import { useRoles } from "../../hooks/roles/rolesHook";
import { usePermisos } from "../../hooks/permisos/permisosHook";
import { ArrowLeft, Plus, Search, Trash2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";
import { getPaginationRange, normalizePagination, paginateRows } from "../pagination";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/rol.css";

function getErrorMessage(error: unknown, fallback: string) {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data as {
            message?: unknown;
            error?: unknown;
            errors?: unknown;
        } | undefined;

        if (typeof data?.message === "string" && data.message.trim()) return data.message;
        if (typeof data?.error === "string" && data.error.trim()) return data.error;

        if (Array.isArray(data?.errors)) {
            const messages = data.errors.filter((item): item is string => typeof item === "string");
            if (messages.length > 0) return messages.join(". ");
        }
    }

    return error instanceof Error ? error.message : fallback;
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

function RolPermisoScreen() {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [rolIdNuevo, setRolIdNuevo] = useState("");
    const [permisoIdNuevo, setPermisoIdNuevo] = useState("");
    const [rolIdBusqueda, setRolIdBusqueda] = useState("");
    const [permisoIdBusqueda, setPermisoIdBusqueda] = useState("");
    const [idsRelacionBuscada, setIdsRelacionBuscada] = useState<{ rolId: string; permisoId: string } | null>(null);
    const navigate = useNavigate();

    const relacionesQuery = useRolPermisos(page, limit);
    const rolesQuery = useRoles(1, 100);
    const permisosQuery = usePermisos(1, 100);
    const permisosNoAsignadosQuery = usePermisosNoAsignados(rolIdNuevo);
    const relacionBuscadaQuery = useRolPermiso(
        idsRelacionBuscada?.rolId ?? null,
        idsRelacionBuscada?.permisoId ?? null
    );
    const createRelacionMutation = useCreateRolPermiso();
    const deleteRelacionMutation = useDeleteRolPermiso();

    const relacionesResponse = relacionesQuery.data;
    const pagination = relacionesResponse?.ok || relacionesResponse?.success
        ? normalizePagination<RolPermiso>(relacionesResponse.data, relacionesResponse, page, limit)
        : normalizePagination<RolPermiso>(undefined, {}, page, limit);
    const relaciones = pagination.rows;
    const total = pagination.total;
    const totalPages = pagination.totalPages;
    const serverPaginated = pagination.serverPaginated;
    const relacionBuscadaResponse = relacionBuscadaQuery.data;
    const relacionBuscada = (relacionBuscadaResponse?.ok || relacionBuscadaResponse?.success)
        ? relacionBuscadaResponse.data ?? null
        : null;
    const rolesData = rolesQuery.data?.ok ? rolesQuery.data.data : undefined;
    const permisosData = permisosQuery.data?.ok ? permisosQuery.data.data : undefined;
    const roles = Array.isArray(rolesData) ? rolesData : rolesData?.rows ?? [];
    const permisos = Array.isArray(permisosData) ? permisosData : permisosData?.rows ?? [];
    const permisosNoAsignados = permisosNoAsignadosQuery.data?.ok
        ? permisosNoAsignadosQuery.data.data ?? []
        : [];

    const handleCrearRelacion = async () => {
        const rolId = Number(rolIdNuevo);
        const permisoId = Number(permisoIdNuevo);

        if (!rolId || !permisoId) {
            toast.error(t("searchRelationship"));
            return;
        }

        try {
            const response = await createRelacionMutation.mutateAsync({ rolId, permisoId });

            if (response.ok || response.success) {
                toast.success(t("relationshipCreated"));
                setRolIdNuevo("");
                setPermisoIdNuevo("");
                if (page !== 1) {
                    setPage(1);
                }
            } else {
                toast.error(response.message || t("relationshipCreated"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("relationshipCreated")));
        }
    };

    const handleBuscarRelacion = async () => {
        if (!rolIdBusqueda.trim() || !permisoIdBusqueda.trim()) {
            toast.error(t("searchRelationship"));
            return;
        }

        const nextIds = {
            rolId: rolIdBusqueda.trim(),
            permisoId: permisoIdBusqueda.trim(),
        };

        if (
            idsRelacionBuscada?.rolId === nextIds.rolId &&
            idsRelacionBuscada.permisoId === nextIds.permisoId &&
            relacionBuscadaQuery.data
        ) {
            if ((!relacionBuscadaQuery.data.ok && !relacionBuscadaQuery.data.success) || !relacionBuscadaQuery.data.data) {
                toast.error(relacionBuscadaQuery.data.message || t("noRelationshipSelected"));
            }
        } else {
            setIdsRelacionBuscada(nextIds);
        }
    };

    const handleEliminar = async (rolId: number, permisoId: number) => {
        if (!window.confirm(t("confirmDeleteRelationship"))) return;

        try {
            const response = await deleteRelacionMutation.mutateAsync({ rolId, permisoId });

            if (response.ok || response.success) {
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
        if (relacionesResponse && !relacionesResponse.ok && !relacionesResponse.success) {
            toast.error(relacionesResponse.message || t("errorLoadRelationships"));
        }
    }, [relacionesResponse]);

    useEffect(() => {
        if (relacionesQuery.error) {
            toast.error(getErrorMessage(relacionesQuery.error, t("errorLoadRelationships")));
        }
    }, [relacionesQuery.error]);

    useEffect(() => {
        const response = relacionBuscadaResponse;

        if (!idsRelacionBuscada || !response) return;

        if ((!response.ok && !response.success) || !response.data) {
            toast.error(response.message || "Relación rol-permiso no encontrada");
        }
    }, [idsRelacionBuscada, relacionBuscadaResponse]);

    useEffect(() => {
        if (relacionBuscadaQuery.error) {
            toast.error(getErrorMessage(relacionBuscadaQuery.error, "Relación rol-permiso no encontrada"));
        }
    }, [relacionBuscadaQuery.error]);

    useEffect(() => {
        if (permisosNoAsignadosQuery.error) {
            toast.error(getErrorMessage(permisosNoAsignadosQuery.error, "No se pudieron cargar los permisos no asignados"));
        }
    }, [permisosNoAsignadosQuery.error]);

    const relacionesVisibles = paginateRows(relaciones, page, limit, serverPaginated);
    const relacionesDeTabla = idsRelacionBuscada
        ? relacionBuscada
            ? [relacionBuscada]
            : []
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
                        <h1>{t("relationshipTitle")}</h1>
                        <p>{t("relationshipDescription")}</p>
                        <QueryFreshness updatedAt={relacionesQuery.dataUpdatedAt} isFetching={relacionesQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-card">
                    <h2>
                        <Plus size={20} />
                        {t("assignPermission")}
                    </h2>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("role")} <b aria-hidden="true">*</b></span>
                            <select
                                value={rolIdNuevo}
                                onChange={(e) => {
                                    setRolIdNuevo(e.target.value);
                                    setPermisoIdNuevo("");
                                }}
                                className="rol-input rol-select"
                            >
                                <option value="">{t("selectRole")}</option>
                                {roles.map((rol) => (
                                    <option key={rol.id} value={rol.id}>
                                        {rol.nombre} (ID: {rol.id})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="rol-field">
                            <span className="rol-field-label">{t("permissions")} <b aria-hidden="true">*</b></span>
                            <select
                                value={permisoIdNuevo}
                                onChange={(e) => setPermisoIdNuevo(e.target.value)}
                                className="rol-input rol-select"
                                disabled={!rolIdNuevo || permisosNoAsignadosQuery.isLoading}
                            >
                                <option value="">
                                    {permisosNoAsignadosQuery.isLoading ? t("loadingPermissions") : t("unassignedPermission")}
                                </option>
                                {permisosNoAsignados.map((permiso) => (
                                    <option key={permiso.id} value={permiso.id}>
                                        {permiso.nombre} (ID: {permiso.id})
                                    </option>
                                ))}
                            </select>
                            {rolIdNuevo && !permisosNoAsignadosQuery.isLoading && permisosNoAsignados.length === 0 && (
                                <small className="rol-field-hint">{t("allPermissionsAssigned")}</small>
                            )}
                        </label>

                        <button onClick={handleCrearRelacion} className="rol-button" disabled={!rolIdNuevo || !permisoIdNuevo}>
                            {t("create")}
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                        <h2>
                            <Search size={20} />
                            {t("searchRelationship")}
                        </h2>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("role")} <b aria-hidden="true">*</b></span>
                            <select
                                value={rolIdBusqueda}
                                onChange={(e) => {
                                    setRolIdBusqueda(e.target.value);
                                    setPermisoIdBusqueda("");
                                }}
                                className="rol-input rol-select"
                            >
                                <option value="">{t("selectRole")}</option>
                                {roles.map((rol) => (
                                    <option key={rol.id} value={rol.id}>
                                        {rol.nombre} (ID: {rol.id})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label className="rol-field">
                            <span className="rol-field-label">{t("permissions")} <b aria-hidden="true">*</b></span>
                            <select
                                value={permisoIdBusqueda}
                                onChange={(e) => setPermisoIdBusqueda(e.target.value)}
                                className="rol-input rol-select"
                                disabled={!rolIdBusqueda}
                            >
                                <option value="">{t("selectPermission")}</option>
                                {permisos.map((permiso) => (
                                    <option key={permiso.id} value={permiso.id}>
                                        {permiso.nombre} (ID: {permiso.id})
                                    </option>
                                ))}
                            </select>
                        </label>

                        <button onClick={handleBuscarRelacion} className="rol-button">
                            {t("search")}
                        </button>
                        {idsRelacionBuscada && (
                            <button
                                type="button"
                                onClick={() => {
                                    setIdsRelacionBuscada(null);
                                    setRolIdBusqueda("");
                                    setPermisoIdBusqueda("");
                                }}
                                className="rol-button rol-cancel"
                            >
                                {t("viewAll")}
                            </button>
                        )}
                    </div>
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                <th>{t("roleId")}</th>
                                <th>{t("role")}</th>
                                <th>{t("permissionId")}</th>
                                <th>{t("permissions")}</th>
                                <th>{t("created")}</th>
                                <th>{t("updated")}</th>
                                <th>{t("actions")}</th>
                            </tr>
                        </thead>

                        <tbody>
                            {relacionesDeTabla.length > 0 ? (
                                relacionesDeTabla.map((relacion) => (
                                    <tr key={`${relacion.rolId}-${relacion.permisoId}`}>
                                        <td>{relacion.rolId}</td>
                                        <td>{relacion.rol?.nombre || "-"}</td>
                                        <td>{relacion.permisoId}</td>
                                        <td>{relacion.permiso?.nombre || "-"}</td>
                                        <td className="rol-date-cell">{formatDate(relacion.createdAt)}</td>
                                        <td className="rol-date-cell">{formatDate(relacion.updatedAt)}</td>
                                        <td>
                                            <div className="rol-actions">
                                                <button
                                                    onClick={() =>
                                                        handleEliminar(relacion.rolId, relacion.permisoId)
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
                                    <td colSpan={7} className="rol-empty">
                                        {idsRelacionBuscada
                                             ? t("noRelationshipSelected")
                                             : t("noRelationships")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        {idsRelacionBuscada
                             ? `${t("showing")} ${relacionesDeTabla.length} ${t("relationshipFound")}`
                             : `${t("showing")} ${primeraRelacion} - ${ultimaRelacion} ${t("of")} ${total} ${t("relationships")}`}
                    </p>

                    {!idsRelacionBuscada && <div className="rol-pagination-controls">
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

export default RolPermisoScreen;
