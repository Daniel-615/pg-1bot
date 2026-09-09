import { useNavigate } from "react-router-dom";
import { Button, Card, Chip } from "@heroui/react";
import {
    ArrowLeft,
    ArrowUpRight,
    Blocks,
    Cpu,
    KeyRound,
    Link2,
    Puzzle,
    Shield,
    ShieldCheck,
    UserRound,
    UserRoundCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "../services/auth.service";
import "../styles/DashboardScreen.css";

type MenuItem = {
    title: string;
    description: string;
    path: string;
    icon: LucideIcon;
    accent: string;
    tag: string;
    requiredPermission: string;
};

const menuItems: MenuItem[] = [
    {
        title: "Usuarios",
        description: "Administrar usuarios del sistema",
        path: "/usuarios",
        icon: UserRound,
        accent: "sky",
        tag: "Identidad",
        requiredPermission: "ver_usuarios",
    },
    {
        title: "Roles",
        description: "Gestionar roles de acceso",
        path: "/rol",
        icon: Shield,
        accent: "indigo",
        tag: "Accesos",
        requiredPermission: "ver_roles",
    },
    {
        title: "Permisos",
        description: "Configurar permisos del sistema",
        path: "/permisos",
        icon: KeyRound,
        accent: "cyan",
        tag: "Seguridad",
        requiredPermission: "ver_permisos",
    },
    {
        title: "Rol Permiso",
        description: "Asignar permisos a roles",
        path: "/rol-permiso",
        icon: Link2,
        accent: "violet",
        tag: "Relaciones",
        requiredPermission: "ver_roles",
    },
    {
        title: "Usuario Rol",
        description: "Asignar roles a usuarios",
        path: "/usuario-rol",
        icon: UserRoundCheck,
        accent: "emerald",
        tag: "Usuarios",
        requiredPermission: "ver_usuarios",
    },
    {
        title: "Extensiones",
        description: "Administrar extensiones disponibles",
        path: "/extensions",
        icon: Puzzle,
        accent: "amber",
        tag: "Builder",
        requiredPermission: "leer_extension",
    },
    {
        title: "Bloques",
        description: "Gestionar bloques de programación",
        path: "/bloques",
        icon: Blocks,
        accent: "rose",
        tag: "Editor",
        requiredPermission: "leer_bloque",
    },
    {
        title: "Placas",
        description: "Administrar placas compatibles",
        path: "/placas",
        icon: Cpu,
        accent: "slate",
        tag: "Hardware",
        requiredPermission: "leer_placa",
    },
];

type DashboardScreenProps = {
    user?: AuthUser;
};

function getDisplayName(user?: AuthUser) {
    const fullName = [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim();

    return fullName || user?.email || "Usuario";
}

function getDisplayRole(user?: AuthUser) {
    const roles = Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : [];

    return roles[0] || "Sin rol";
}

export const DashboardScreen = ({ user }: DashboardScreenProps) => {
    const navigate = useNavigate();
    const permissions = new Set(user?.permisos ?? []);
    const roles = [
        ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
        ...(user?.roles ?? []).map((role) => role.nombre),
    ].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
    const isAdmin = roles.some((role) => role === "admin" || role === "1botpersonal");
    const visibleItems = menuItems.filter((item) => isAdmin || permissions.has(item.requiredPermission));
    const restrictedItems = menuItems.length - visibleItems.length;

    return (
        <main className="dashboard-container">
            <section className="dashboard-hero">
                <div className="dashboard-hero-copy">
                    <Button
                        isIconOnly
                        variant="primary"
                        className="dashboard-back"
                        aria-label="Volver al editor"
                        onPress={() => navigate("/")}
                    >
                        <ArrowLeft size={22} />
                    </Button>

                    <Chip color="accent" variant="soft" className="dashboard-eyebrow">Panel de administración</Chip>

                    <h1>Gestiona 1bot desde un solo lugar</h1>
                    <p className="dashboard-description">
                        {isAdmin
                            ? "Desde este panel puedes administrar usuarios, roles, permisos, extensiones, bloques y placas del sistema."
                            : "Desde este panel puedes administrar extensiones, bloques y placas del sistema."}
                    </p>

                    <div className="dashboard-hero-actions">
                        <Button
                            className="dashboard-primary-action"
                            onPress={() => navigate(visibleItems[0]?.path || "/")}
                        >
                            Abrir primera sección
                            <ArrowUpRight size={18} />
                        </Button>

                        {visibleItems.some((item) => item.path === "/extensions") && (
                            <Button
                                variant="secondary"
                                className="dashboard-extensions-action"
                                onPress={() => navigate("/extensions")}
                            >
                                <Puzzle size={18} />
                                Ver extensiones
                            </Button>
                        )}

                        <Chip color="accent" variant="soft" className="dashboard-role-chip">
                            <ShieldCheck size={16} />
                            {getDisplayRole(user)}
                        </Chip>
                    </div>
                </div>

                <Card className="dashboard-profile-card">
                    <Card.Content>
                    <img src="/logo.webp" alt="1bot" className="dashboard-logo" />
                    <Chip color="success" variant="soft">Sesión activa</Chip>
                    <h2>{getDisplayName(user)}</h2>
                    <p>{isAdmin ? "Acceso completo al panel" : "Acceso operativo 1bot"}</p>
                    </Card.Content>
                </Card>
            </section>

            <section className="dashboard-stats" aria-label="Resumen del panel">
                <Card className="dashboard-stat-card dashboard-stat-card-primary"><Card.Content>
                    <span>Secciones visibles</span>
                    <strong>{visibleItems.length}</strong>
                </Card.Content></Card>

                <Card className="dashboard-stat-card dashboard-stat-card-access"><Card.Content>
                    <span>Acceso</span>
                    <strong>{isAdmin ? "Total" : "Limitado"}</strong>
                </Card.Content></Card>

                <Card className="dashboard-stat-card dashboard-stat-card-restricted"><Card.Content>
                    <span>Restringidas</span>
                    <strong>{restrictedItems}</strong>
                </Card.Content></Card>
            </section>

            <section className="dashboard-section-heading">
                <div>
                    <span>Módulos</span>
                    <h2>Elige una sección para administrar</h2>
                    <p>Accede rápidamente a las herramientas que tienes habilitadas.</p>
                </div>
                <span className="dashboard-module-count">{visibleItems.length} disponibles</span>
            </section>

            <section className="dashboard-grid">
                {visibleItems.map((item) => {
                    const Icon = item.icon;

                    return (
                        <button
                            key={item.path}
                            className={`dashboard-card dashboard-card-${item.accent}`}
                            onClick={() => navigate(item.path)}
                        >
                            <span className="dashboard-card-tag">{item.tag}</span>
                            <span className="dashboard-icon">
                                <Icon size={27} strokeWidth={2.1} aria-hidden="true" />
                            </span>

                            <div>
                                <h2>{item.title}</h2>
                                <p>{item.description}</p>
                            </div>

                            <span className="dashboard-card-arrow">
                                <ArrowUpRight size={18} />
                            </span>
                        </button>
                    );
                })}
            </section>
        </main>
    );
};

export default DashboardScreen;
