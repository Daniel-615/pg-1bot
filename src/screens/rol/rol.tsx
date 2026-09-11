import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
        if (!window.confirm(t("confirmDeleteRole"))) return;

        try {
            const response = await deleteRolMutation.mutateAsync(id);

            if (response.ok) {
                toast.success(t("roleDeleted"));
                if (!serverPaginated && rolesVisibles.length === 1 && page > 1) {
                    setPage(page - 1);
                }
            } else {
                toast.error(response.message || t("roleDeleted"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("roleDeleted")));
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
                toast.success(t("roleUpdated"));
                setRolEditando(null);
            } else {
                toast.error(response.message || t("roleUpdated"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("roleUpdated")));
        }
    };

    const handleCrearRol = async () => {
        if (!nombreNuevo.trim()) {
            toast.error(t("roleNameRequired"));
            return;
        }

        try {
            const response = await createRolMutation.mutateAsync({ nombre: nombreNuevo });

            if (response.ok) {
                toast.success(t("roleCreated"));
                setNombreNuevo("");
                if (page !== 1) {
                    setPage(1);
                }
            } else {
                toast.error(response.message || t("roleCreated"));
            }
        } catch (error) {
            toast.error(getErrorMessage(error, t("roleCreated")));
        }
    };

    useEffect(() => {
        if (rolesResponse && !rolesResponse.ok) {
            toast.error(rolesResponse.message || t("errorLoadRoles"));
        }
    }, [rolesResponse]);

    useEffect(() => {
        if (rolesQuery.error) {
            toast.error(getErrorMessage(rolesQuery.error, t("errorLoadRoles")));
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
                            <span className="rol-eyebrow">{t("accessControl")}</span>
                            <h1>{t("rolesTitle")}</h1>
                            <p>{t("rolesDescription")}</p>
                        <QueryFreshness updatedAt={rolesQuery.dataUpdatedAt} isFetching={rolesQuery.isFetching} />
                    </div>
                </header>

                <section className="rol-stats" aria-label={t("roles")}>
                    <div className="rol-stat-card">
                        <span className="rol-stat-icon rol-stat-icon-purple"><Layers3 size={19} /></span>
                        <div><small>{t("registeredRoles")}</small><strong>{total}</strong></div>
                    </div>
                    <div className="rol-stat-card">
                        <span className="rol-stat-icon rol-stat-icon-green"><ShieldCheck size={19} /></span>
                        <div><small>{t("catalogStatus")}</small><strong>{t("activeStatus")}</strong></div>
                    </div>
                </section>

                <section className="rol-card">
                        <h2>
                            <Plus size={20} />
                            {t("newRole")}
                        </h2>
                        <p className="rol-card-description">{t("newRoleDescription")}</p>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("name")} {t("role")} <b aria-hidden="true">*</b></span>
                            <input type="text" value={nombreNuevo} onChange={(e) => setNombreNuevo(e.target.value)} className="rol-input" placeholder="Ej. supervisor, editor..." />
                        </label>

                        <button onClick={handleCrearRol} className="rol-button">
                            {t("createRole")}
                        </button>
                    </div>
                </section>

                <section className="rol-card">
                    <h2>
                        <Search size={20} />
                            {t("searchRole")}
                        </h2>
                        <p className="rol-card-description">{t("searchRoleDescription")}</p>

                    <div className="rol-form">
                        <label className="rol-field">
                            <span className="rol-field-label">{t("role")} <b aria-hidden="true">*</b></span>
                            <select value={idBusqueda} onChange={(e) => { setIdBusqueda(e.target.value); setPage(1); }} className="rol-input rol-select">
                                <option value="">{t("selectRoleRequired")}</option>
                                {rolesCatalog.map((rol) => <option key={rol.id} value={rol.id}>{rol.nombre} (ID: {rol.id})</option>)}
                            </select>
                        </label>
                        {idBusqueda && <button type="button" onClick={() => setIdBusqueda("")} className="rol-button rol-cancel">{t("allRoles")}</button>}
                    </div>
                </section>

                <section className="rol-table rol-table-scroll">
                    <table>
                        <thead>
                            <tr>
                                        <th>ID</th>
                                        <th>{t("role")}</th>
                                        <th>{t("created")}</th>
                                        <th>{t("updated")}</th>
                                        <th>{t("actions")}</th>
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
                                                    {t("edit")}
                                                </button>

                                                <button
                                                    onClick={() => handleEliminar(r.id)}
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
                                    <td colSpan={5} className="rol-empty">
                                            {idBusqueda ? t("noRoleSelected") : t("noRoles")}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </section>

                <section className="rol-pagination">
                    <p>
                        {idBusqueda ? `${t("showing")} 1 ${t("rolesPage")}` : `${t("showing")} ${primerRol} - ${ultimoRol} ${t("of")} ${total} ${t("rolesPage")}`}
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
                            {t("page")} {page} {t("of")} {Math.max(totalPages, 1)}
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

                {rolEditando && (
                    <section className="rol-modal">
                        <h2>
                            <Edit2 size={20} />
                            {t("editRole")}
                        </h2>

                        <input
                            type="text"
                            value={nombreEditado}
                            onChange={(e) => setNombreEditado(e.target.value)}
                            className="rol-input"
                            placeholder={t("name") + " " + t("role").toLowerCase()}
                        />

                        <div className="rol-modal-buttons">
                            <button onClick={handleGuardarEdicion} className="rol-button">
                                {t("save")}
                            </button>

                            <button
                                onClick={() => setRolEditando(null)}
                                className="rol-button rol-cancel"
                            >
                                {t("cancel")}
                            </button>
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
}

export default RolScreen;
