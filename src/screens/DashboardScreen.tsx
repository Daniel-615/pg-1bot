import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import {
    ArrowLeft,
    Blocks,
    Cpu,
    KeyRound,
    Link2,
    Puzzle,
    Shield,
    UserRound,
    UserRoundCheck,
    BarChart3,
    ChevronRight,
    LayoutDashboard,
    LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { AuthUser } from "../services/auth.service";
import { Logout } from "../services/auth.service";
import { toast } from "react-toastify";
import "../styles/DashboardScreen.css";
import { getEvaluationMetrics, type EvaluationMetrics } from "../services/evaluations.service";

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
    const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
    const [metricsError, setMetricsError] = useState(false);
    const permissions = new Set(user?.permisos ?? []);
    const roles = [
        ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
        ...(user?.roles ?? []).map((role) => role.nombre),
    ].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
    const isAdmin = roles.some((role) => role === "admin" || role === "1botpersonal");
    const visibleItems = menuItems.filter((item) => isAdmin || permissions.has(item.requiredPermission));
    const restrictedItems = menuItems.length - visibleItems.length;
    const userId = user?.id ?? user?.userId;

    const handleLogout = async () => {
        const response = await Logout();
        if (!response.success) toast.error(response.error);
        else toast.success("Sesión cerrada");
        navigate("/login", { replace: true });
    };

    useEffect(() => {
        if (!userId) return;
        getEvaluationMetrics(userId).then(setMetrics).catch(() => setMetricsError(true));
    }, [userId]);

    const initialScore = metrics?.inicial ?? 0;
    const finalScore = metrics?.final ?? 0;
    const chartPoints = `${22},${148 - initialScore * 1.16} 50,${148 - initialScore * 1.16} 78,${148 - finalScore * 1.16} 106,${148 - finalScore * 1.16}`;

    return (
        <main className="dashboard-container">
            <aside className="dashboard-sidebar">
                <button className="dashboard-brand dashboard-brand-link" type="button" aria-label="Ir al playground de 1bot" onClick={() => navigate("/")}><img src="/logo.webp" alt="1bot" /><div><strong>1bot</strong><span>Ir al playground</span></div></button>
                <button className="dashboard-home active" onClick={() => navigate("/dashboard")}><LayoutDashboard size={18} />Resumen</button>
                <span className="dashboard-nav-label">Administración</span>
                <nav className="dashboard-nav" aria-label="Módulos de administración">
                    {visibleItems.map((item) => { const Icon = item.icon; return <button key={item.path} onClick={() => navigate(item.path)}><Icon size={17} /><span>{item.title}</span><ChevronRight size={15} /></button>; })}
                </nav>
                <div className="dashboard-sidebar-footer"><div className="dashboard-user-mini"><div>{getDisplayName(user).slice(0, 1).toUpperCase()}</div><span><strong>{getDisplayName(user)}</strong><small>{getDisplayRole(user)}</small></span></div><button type="button" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => void handleLogout()}><LogOut size={17} /></button></div>
            </aside>
            <section className="dashboard-main-content">
                <header className="dashboard-topbar"><div><span className="dashboard-kicker">Panel de administración</span><h1>Resumen de aprendizaje</h1><p>Una lectura clara del progreso y las herramientas de tu plataforma.</p></div><Button className="dashboard-editor-button" onPress={() => navigate("/")}><ArrowLeft size={16} />Volver al editor</Button></header>
                <section className="dashboard-overview-cards"><Card><Card.Content><span>Secciones disponibles</span><strong>{visibleItems.length}</strong><small>de {menuItems.length} módulos</small></Card.Content></Card><Card><Card.Content><span>Nivel de acceso</span><strong>{isAdmin ? "Total" : "Operativo"}</strong><small>{restrictedItems} restringidas</small></Card.Content></Card><Card><Card.Content><span>Estado de sesión</span><strong className="status-live">Activa</strong><small>{getDisplayName(user)}</small></Card.Content></Card></section>
                <section className="dashboard-chart-card"><div className="dashboard-chart-header"><div><span className="dashboard-kicker">Evidencia de progreso</span><h2>Desempeño de programación</h2><p>Comparación entre la evaluación inicial y final.</p></div><div className={`dashboard-growth ${metrics?.mejoraPorcentual && metrics.mejoraPorcentual >= 0 ? "positive" : ""}`}><BarChart3 size={18} /><strong>{metrics?.mejoraPorcentual !== null && metrics?.mejoraPorcentual !== undefined ? `${metrics.mejoraPorcentual >= 0 ? "+" : ""}${metrics.mejoraPorcentual.toFixed(1)}%` : "--"}</strong><span>variación</span></div></div><div className="dashboard-chart-wrap"><svg viewBox="0 0 128 170" role="img" aria-label="Gráfico de desempeño pretest y postest" preserveAspectRatio="none"><defs><linearGradient id="progressFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#818cf8" stopOpacity=".35" /><stop offset="1" stopColor="#818cf8" stopOpacity="0" /></linearGradient></defs><path d="M22 148 H106 M22 112 H106 M22 76 H106 M22 40 H106" className="chart-grid-line" /><polygon points={`22,148 ${chartPoints} 106,148`} fill="url(#progressFill)" /><polyline points={chartPoints} className="chart-line" />{[22, 106].map((x, i) => <circle key={x} cx={x} cy={i === 0 ? 148 - initialScore * 1.16 : 148 - finalScore * 1.16} r="3" className="chart-dot" />)}</svg><div className="chart-labels"><span><b>{metrics?.inicial != null ? `${metrics.inicial.toFixed(0)}%` : "--"}</b>Pretest</span><span><b>{metrics?.final != null ? `${metrics.final.toFixed(0)}%` : "--"}</b>Postest</span></div></div>{metricsError && <p className="dashboard-chart-note">No se pudieron cargar las evaluaciones. Verifica que el servicio esté disponible.</p>}{!metricsError && !metrics?.muestraPretest && <p className="dashboard-chart-note">Registra un pretest y un postest para visualizar el progreso.</p>}</section>
            </section>
        </main>
    );
};

export default DashboardScreen;
