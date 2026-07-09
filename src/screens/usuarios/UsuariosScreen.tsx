import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Chip,
    Spinner,
    Table,
} from "@heroui/react";
import { ArrowLeft, RefreshCw, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
    type Usuario,
    type UsuarioPagination,
    type UsuarioResponse,
} from "../../services/usuario.service";
import { useUsuarios, type UsuarioFilter } from "../../hooks/usuarios/usuariosHook";
import { QueryFreshness } from "../components/QueryFreshness";
import "../../styles/UsuariosScreen.css";

type UsuarioPayload = UsuarioResponse<Usuario[] | UsuarioPagination> | Usuario[];

const filterOptions: { key: UsuarioFilter; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "activos", label: "Activos" },
    { key: "inactivos", label: "No activos" },
];

function isUsuarioFilter(value: string): value is UsuarioFilter {
    return filterOptions.some((option) => option.key === value);
}

function isUsuarioPagination(value: unknown): value is UsuarioPagination {
    return Boolean(
        value &&
        typeof value === "object" &&
        "rows" in value &&
        Array.isArray((value as UsuarioPagination).rows)
    );
}

function extractUsuarios(payload: UsuarioPayload): Usuario[] {
    if (Array.isArray(payload)) {
        return payload;
    }

    if (isUsuarioPagination(payload.data)) {
        return payload.data.rows;
    }

    if (Array.isArray(payload.data)) {
        return payload.data;
    }

    if (Array.isArray(payload.usuarios)) {
        return payload.usuarios;
    }

    if (Array.isArray(payload.users)) {
        return payload.users;
    }

    if (Array.isArray(payload.rows)) {
        return payload.rows;
    }

    return [];
}

function getUsuarioId(usuario: Usuario) {
    return usuario.id ?? usuario.userId ?? "-";
}

function getUsuarioNombre(usuario: Usuario) {
    const fullName = [usuario.nombre, usuario.apellido].filter(Boolean).join(" ").trim();

    return fullName || usuario.email || "Sin nombre";
}

function getUsuarioActivo(usuario: Usuario): boolean | null {
    const value = usuario.activo ?? usuario.isActive ?? usuario.estado ?? usuario.status;

    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value === 1;
    }

    if (typeof value === "string") {
        const normalized = value.trim().toLowerCase();

        if (["activo", "active", "true", "1", "habilitado"].includes(normalized)) {
            return true;
        }

        if (["inactivo", "inactive", "false", "0", "deshabilitado"].includes(normalized)) {
            return false;
        }
    }

    return null;
}

function formatDate(value?: string) {
    if (!value) {
        return "-";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    return new Intl.DateTimeFormat("es", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    }).format(date);
}

function getErrorMessage(error: unknown) {
    return error instanceof Error ? error.message : "Error al cargar los usuarios";
}

function UsuariosScreen() {
    const [filter, setFilter] = useState<UsuarioFilter>("todos");
    const navigate = useNavigate();
    const usuariosQuery = useUsuarios(filter);
    const usuariosPayload = usuariosQuery.data;
    const isLoading = usuariosQuery.isLoading || usuariosQuery.isFetching;
    const usuarios = usuariosPayload && (!Array.isArray(usuariosPayload) && usuariosPayload.ok === false)
        ? []
        : usuariosPayload
            ? extractUsuarios(usuariosPayload)
            : [];

    useEffect(() => {
        if (!Array.isArray(usuariosPayload) && usuariosPayload?.ok === false) {
            toast.error(usuariosPayload.message || "Error al cargar los usuarios");
        }
    }, [usuariosPayload]);

    useEffect(() => {
        if (usuariosQuery.error) {
            toast.error(getErrorMessage(usuariosQuery.error));
        }
    }, [usuariosQuery.error]);

    const usuariosVisibles = filter === "inactivos"
        ? usuarios.filter((usuario) => getUsuarioActivo(usuario) === false)
        : usuarios;

    const totalActivos = usuarios.filter((usuario) => getUsuarioActivo(usuario) === true).length;
    const totalInactivos = usuarios.filter((usuario) => getUsuarioActivo(usuario) === false).length;

    return (
        <main className="usuarios-container">
            <section className="usuarios-hero">
                <Button
                    isIconOnly
                    variant="primary"
                    className="usuarios-back"
                    aria-label="Volver al dashboard"
                    onPress={() => navigate("/dashboard")}
                >
                    <ArrowLeft size={22} />
                </Button>

                <div className="usuarios-title">
                    <span className="usuarios-eyebrow">Panel de administración</span>
                    <h1>Usuarios</h1>
                    <p>Consulta los usuarios registrados y filtra por estado activo o no activo.</p>
                    <QueryFreshness updatedAt={usuariosQuery.dataUpdatedAt} isFetching={usuariosQuery.isFetching} />
                </div>
            </section>

            <section className="usuarios-stats">
                <Card className="usuarios-stat-card">
                    <Card.Content>
                        <span>Total mostrado</span>
                        <strong>{usuariosVisibles.length}</strong>
                    </Card.Content>
                </Card>

                <Card className="usuarios-stat-card usuarios-stat-card-active">
                    <Card.Content>
                        <span>Activos</span>
                        <strong>{filter === "activos" ? usuarios.length : totalActivos}</strong>
                    </Card.Content>
                </Card>

                <Card className="usuarios-stat-card usuarios-stat-card-inactive">
                    <Card.Content>
                        <span>No activos</span>
                        <strong>{filter === "activos" ? 0 : totalInactivos}</strong>
                    </Card.Content>
                </Card>
            </section>

            <Card className="usuarios-card">
                <Card.Content className="usuarios-card-body">
                    <div className="usuarios-toolbar">
                        <div>
                            <h2>
                                <Users size={22} />
                                Lista de usuarios
                            </h2>
                            <p>
                                {filter === "activos"
                                    ? "Estos son los usuarios que se encuentran activos."
                                    : "Estos son los usuarios que se encuentran."}
                            </p>
                        </div>

                        <div className="usuarios-actions">
                            <label className="usuarios-filter-label">
                                Estado
                                <select
                                    className="usuarios-filter"
                                    value={filter}
                                    onChange={(event) => {
                                        if (isUsuarioFilter(event.target.value)) {
                                            setFilter(event.target.value);
                                        }
                                    }}
                                >
                                    {filterOptions.map((option) => (
                                        <option key={option.key} value={option.key}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            <Button
                                variant="secondary"
                                className="usuarios-refresh"
                                isDisabled={isLoading}
                                onPress={() => void usuariosQuery.refetch()}
                            >
                                {isLoading ? <Spinner size="sm" /> : <RefreshCw size={18} />}
                                <span>Actualizar</span>
                            </Button>
                        </div>
                    </div>

                    <Table className="usuarios-table" variant="primary">
                        <Table.ScrollContainer className="usuarios-table-wrapper">
                            <Table.Content aria-label="Tabla de usuarios">
                                <Table.Header>
                                    <Table.Column className="usuarios-table-head" isRowHeader>ID</Table.Column>
                                    <Table.Column className="usuarios-table-head">Nombre</Table.Column>
                                    <Table.Column className="usuarios-table-head">Email</Table.Column>
                                    <Table.Column className="usuarios-table-head">Estado</Table.Column>
                                    <Table.Column className="usuarios-table-head">Creado</Table.Column>
                                    <Table.Column className="usuarios-table-head">Actualizado</Table.Column>
                                </Table.Header>

                                <Table.Body>
                                    {usuariosVisibles.map((usuario, index) => {
                                        const estado = getUsuarioActivo(usuario);
                                        const usuarioId = getUsuarioId(usuario);

                                        return (
                                            <Table.Row key={String(usuarioId === "-" ? `usuario-${index}` : usuarioId)}>
                                                <Table.Cell className="usuarios-table-cell">{usuarioId}</Table.Cell>
                                                <Table.Cell className="usuarios-table-cell">{getUsuarioNombre(usuario)}</Table.Cell>
                                                <Table.Cell className="usuarios-table-cell">{usuario.email || "-"}</Table.Cell>
                                                <Table.Cell className="usuarios-table-cell">
                                                    <Chip
                                                        className={`usuarios-status ${estado ? "usuarios-status-active" : estado === false ? "usuarios-status-inactive" : "usuarios-status-unknown"}`}
                                                        color={estado ? "success" : estado === false ? "danger" : "default"}
                                                        variant="soft"
                                                    >
                                                        {estado ? "Activo" : estado === false ? "No activo" : "Sin dato"}
                                                    </Chip>
                                                </Table.Cell>
                                                <Table.Cell className="usuarios-table-cell">{formatDate(usuario.createdAt)}</Table.Cell>
                                                <Table.Cell className="usuarios-table-cell">{formatDate(usuario.updatedAt)}</Table.Cell>
                                            </Table.Row>
                                        );
                                    })}
                                </Table.Body>
                            </Table.Content>
                        </Table.ScrollContainer>
                    </Table>

                    {isLoading && (
                        <div className="usuarios-loading">
                            <Spinner size="sm" />
                            <span>Cargando usuarios...</span>
                        </div>
                    )}

                    {!isLoading && usuariosVisibles.length === 0 && (
                        <div className="usuarios-empty">No hay usuarios para mostrar.</div>
                    )}
                </Card.Content>
            </Card>
        </main>
    );
}

export default UsuariosScreen;
