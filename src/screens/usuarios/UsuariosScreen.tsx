import { useEffect, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
    Button,
    Card,
    Chip,
    Spinner,
    Table,
} from "@heroui/react";
import { ArrowLeft, Plus, RefreshCw, Users } from "lucide-react";
import { toast } from "react-toastify";
import {
    type Usuario,
    type UsuarioPagination,
    type UsuarioResponse,
} from "../../services/usuario.service";
import { useUsuarios, type UsuarioFilter } from "../../hooks/usuarios/usuariosHook";
import { QueryFreshness } from "../components/QueryFreshness";
import { registerRequestEmployee } from "../../services/auth.service";
import { useRoles } from "../../hooks/roles/rolesHook";
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
    const rolesQuery = useRoles(1, 100);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newUser, setNewUser] = useState({ nombre: "", apellido: "", email: "", password: "", edad: "", rolId: "" });
    const [isCreating, setIsCreating] = useState(false);
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
    const rolesData = rolesQuery.data?.data;
    const roles = Array.isArray(rolesData) ? rolesData : rolesData?.rows ?? [];

    const handleCreateUser = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const age = Number(newUser.edad);
        if (!newUser.nombre.trim() || !newUser.apellido.trim() || !newUser.email.trim() || !newUser.password || !newUser.rolId || !Number.isInteger(age) || age < 5 || age > 120) {
            toast.error("Completa todos los campos y usa una edad válida.");
            return;
        }
        setIsCreating(true);
        try {
            const response = await registerRequestEmployee({ ...newUser, edad: age, rolId: Number(newUser.rolId) });
            if (!response.success) {
                toast.error(response.error);
                return;
            }
            toast.success("Usuario creado correctamente.");
            setNewUser({ nombre: "", apellido: "", email: "", password: "", edad: "", rolId: "" });
            setShowCreateForm(false);
            await usuariosQuery.refetch();
        } catch (error) {
            toast.error(getErrorMessage(error));
        } finally {
            setIsCreating(false);
        }
    };

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
                            <Button className="usuarios-create-button" variant="primary" onPress={() => setShowCreateForm((current) => !current)}>
                                {showCreateForm ? <Users size={18} /> : <Plus size={18} />}
                                {showCreateForm ? "Cerrar" : "Crear usuario"}
                            </Button>
                        </div>
                    </div>

                    {showCreateForm && (
                        <form className="usuarios-create-form" onSubmit={handleCreateUser}>
                            <div className="usuarios-create-heading"><div><span>Alta administrativa</span><h3>Crear usuario interno</h3></div><small>Solo disponible para roles autorizados</small></div>
                            <div className="usuarios-create-grid">
                                {([["nombre", "Nombre"], ["apellido", "Apellido"], ["email", "Correo"]] as const).map(([field, label]) => <label key={field}>{label}<input type={field === "email" ? "email" : "text"} value={newUser[field]} onChange={(event) => setNewUser((current) => ({ ...current, [field]: event.target.value }))} disabled={isCreating} /></label>)}
                                <label>Edad<input type="number" min="5" max="120" value={newUser.edad} onChange={(event) => setNewUser((current) => ({ ...current, edad: event.target.value }))} disabled={isCreating} /></label>
                                <label>Contraseña<input type="password" value={newUser.password} onChange={(event) => setNewUser((current) => ({ ...current, password: event.target.value }))} disabled={isCreating} /></label>
                                <label>Rol<select value={newUser.rolId} onChange={(event) => setNewUser((current) => ({ ...current, rolId: event.target.value }))} disabled={isCreating || rolesQuery.isLoading}><option value="">Selecciona un rol</option>{roles.filter((role) => ["empleado", "1botpersonal"].includes(role.nombre.trim().toLowerCase().replace(/\s+/g, ""))).map((role) => <option key={role.id} value={role.id}>{role.nombre}</option>)}</select></label>
                            </div>
                            <Button type="submit" className="usuarios-submit-button" variant="primary" isDisabled={isCreating}>{isCreating ? "Creando..." : "Crear usuario"}</Button>
                        </form>
                    )}

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
