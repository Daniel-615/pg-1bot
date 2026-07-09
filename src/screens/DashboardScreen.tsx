import { useNavigate } from "react-router-dom";
import "./DashboardScreen.css";
import { ArrowLeft, ArrowUpRight, ShieldCheck } from "lucide-react";
import type { AuthUser } from "../api/auth";

type MenuItem = {
    title: string;
    description: string;
    path: string;
    icon: string;
    accent: string;
    tag: string;
    oneBotPersonal?: boolean;
};

const menuItems: MenuItem[] = [
    {
        title: "Usuarios",
        description: "Administrar usuarios del sistema",
        path: "/usuarios",
        icon: "👤",
        accent: "sky",
        tag: "Identidad",
    },
    {
        title: "Roles",
        description: "Gestionar roles de acceso",
        path: "/rol",
        icon: "🛡️",
        accent: "indigo",
        tag: "Accesos",
    },
    {
        title: "Permisos",
        description: "Configurar permisos del sistema",
        path: "/permisos",
        icon: "🔐",
        accent: "cyan",
        tag: "Seguridad",
    },
    {
        title: "Rol Permiso",
        description: "Asignar permisos a roles",
        path: "/rol-permiso",
        icon: "🔗",
        accent: "violet",
        tag: "Relaciones",
    },
    {
        title: "Usuario Rol",
        description: "Asignar roles a usuarios",
        path: "/usuario-rol",
        icon: "✅",
        accent: "emerald",
        tag: "Usuarios",
    },
    {
        title: "Extensiones",
        description: "Administrar extensiones disponibles",
        path: "/extensions",
        icon: "🧩",
        accent: "amber",
        tag: "Builder",
        oneBotPersonal: true,
    },
    {
        title: "Bloques",
        description: "Gestionar bloques de programación",
        path: "/bloques",
        icon: "🧱",
        accent: "rose",
        tag: "Editor",
        oneBotPersonal: true,
    },
    {
        title: "Placas",
        description: "Administrar placas compatibles",
        path: "/placas",
        icon: "💻",
        accent: "slate",
        tag: "Hardware",
        oneBotPersonal: true,
    },
];

type DashboardScreenProps = {
    user?: AuthUser;
};

function getUserRoles( user?: AuthUser) {
    const roles = Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : [];

    return roles.map((role) => role.toLowerCase());
}

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
    const roles = getUserRoles(user);
    const isAdmin = roles.includes("admin");
    const visibleItems = isAdmin ? menuItems : menuItems.filter((item) => item.oneBotPersonal);
    const restrictedItems = menuItems.length - visibleItems.length;

    return (
        <main className="dashboard-container">
            <section className="dashboard-hero">
                <div className="dashboard-hero-copy">
                    <button
                        onClick={() => navigate("/")}
                        className="dashboard-back"
                        aria-label="Volver al editor"
                    >
                        <ArrowLeft size={22} />
                    </button>

                    <div className="dashboard-eyebrow">
                        Panel de administración
                    </div>

                    <h1>Gestiona 1bot desde un solo lugar</h1>
                    <p className="dashboard-description">
                        {isAdmin
                            ? "Desde este panel puedes administrar usuarios, roles, permisos, extensiones, bloques y placas del sistema."
                            : "Desde este panel puedes administrar extensiones, bloques y placas del sistema."}
                    </p>

                    <div className="dashboard-hero-actions">
                        <button className="dashboard-primary-action" onClick={() => navigate(visibleItems[0]?.path || "/")}>
                            Abrir primera sección
                            <ArrowUpRight size={18} />
                        </button>

                        <span className="dashboard-role-chip">
                            <ShieldCheck size={16} />
                            {getDisplayRole(user)}
                        </span>
                    </div>
                </div>

                <aside className="dashboard-profile-card">
                    <img src="/logo.webp" alt="1bot" className="dashboard-logo" />
                    <span>Sesión activa</span>
                    <h2>{getDisplayName(user)}</h2>
                    <p>{isAdmin ? "Acceso completo al panel" : "Acceso operativo 1bot"}</p>
                </aside>
            </section>

            <section className="dashboard-stats" aria-label="Resumen del panel">
                <article>
                    <span>Secciones visibles</span>
                    <strong>{visibleItems.length}</strong>
                </article>

                <article>
                    <span>Acceso</span>
                    <strong>{isAdmin ? "Total" : "Limitado"}</strong>
                </article>

                <article>
                    <span>Restringidas</span>
                    <strong>{restrictedItems}</strong>
                </article>
            </section>

            <section className="dashboard-section-heading">
                <div>
                    <span>Módulos</span>
                    <h2>Elige una sección para administrar</h2>
                </div>
            </section>

            <section className="dashboard-grid">
                {visibleItems.map((item) => (
                    <button
                        key={item.path}
                        className={`dashboard-card dashboard-card-${item.accent}`}
                        onClick={() => navigate(item.path)}
                    >
                        <span className="dashboard-card-tag">{item.tag}</span>
                        <span className="dashboard-icon">{item.icon}</span>

                        <div>
                            <h2>{item.title}</h2>
                            <p>{item.description}</p>
                        </div>

                        <span className="dashboard-card-arrow">
                            <ArrowUpRight size={18} />
                        </span>
                    </button>
                ))}
            </section>
        </main>
    );
};

export default DashboardScreen;
