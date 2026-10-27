import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card } from "@heroui/react";
import { ArrowLeft, BarChart3, Blocks, ChevronRight, Cpu, KeyRound, LayoutDashboard, Link2, LogOut, Puzzle, Shield, UserRound, UserRoundCheck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { AuthUser } from "../services/auth.service";
import { Logout } from "../services/auth.service";
import { toast } from "react-toastify";
import "../styles/DashboardScreen.css";
import { getEvaluationMetrics, getGlobalEvaluationMetrics, type EvaluationMetrics } from "../services/evaluations.service";

type MenuItem = { title: string; description: string; path: string; icon: LucideIcon; accent: string; tag: string; requiredPermission: string };

const menuItems: MenuItem[] = [
  { title: "Usuarios", description: "Administrar usuarios del sistema", path: "/usuarios", icon: UserRound, accent: "sky", tag: "Identidad", requiredPermission: "ver_usuarios" },
  { title: "Roles", description: "Gestionar roles de acceso", path: "/rol", icon: Shield, accent: "indigo", tag: "Accesos", requiredPermission: "ver_roles" },
  { title: "Permisos", description: "Configurar permisos del sistema", path: "/permisos", icon: KeyRound, accent: "cyan", tag: "Seguridad", requiredPermission: "ver_permisos" },
  { title: "Rol Permiso", description: "Asignar permisos a roles", path: "/rol-permiso", icon: Link2, accent: "violet", tag: "Relaciones", requiredPermission: "ver_roles" },
  { title: "Usuario Rol", description: "Asignar roles a usuarios", path: "/usuario-rol", icon: UserRoundCheck, accent: "emerald", tag: "Usuarios", requiredPermission: "ver_usuarios" },
  { title: "Extensiones", description: "Administrar extensiones disponibles", path: "/extensions", icon: Puzzle, accent: "amber", tag: "Builder", requiredPermission: "leer_extension" },
  { title: "Bloques", description: "Gestionar bloques de programación", path: "/bloques", icon: Blocks, accent: "rose", tag: "Editor", requiredPermission: "leer_bloque" },
  { title: "Placas", description: "Administrar placas compatibles", path: "/placas", icon: Cpu, accent: "slate", tag: "Hardware", requiredPermission: "leer_placa" },
];

type DashboardScreenProps = { user?: AuthUser };

function getDisplayName(user?: AuthUser) {
  return [user?.nombre, user?.apellido].filter(Boolean).join(" ").trim() || user?.email || "Usuario";
}

function getDisplayRole(user?: AuthUser) {
  const roles = Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : [];
  return roles[0] || "Sin rol";
}

function formatScore(value: number | null | undefined) {
  return value == null ? "--" : `${value.toFixed(0)}%`;
}

function MetricsChart({ metrics, isAdmin, ageRange, onAgeChange }: { metrics: EvaluationMetrics | null; isAdmin: boolean; ageRange: string; onAgeChange: (value: string) => void }) {
  const chartData = [
    { name: "Pretest", score: metrics?.inicial ?? 0, label: "Punto de partida" },
    { name: "Postest", score: metrics?.final ?? 0, label: "Resultado final" },
  ];
  const hasData = metrics?.inicial != null || metrics?.final != null;
  const change = metrics?.mejoraPorcentual;
  const changePositive = change != null && change >= 0;

  return (
    <section className="dashboard-chart-card">
      <div className="dashboard-chart-header">
        <div className="dashboard-chart-title">
          <span className="dashboard-kicker">Métricas de evaluación</span>
          <h2>Desempeño de programación</h2>
          <p>Una lectura visual del cambio entre el diagnóstico inicial y el resultado final.</p>
        </div>
        {isAdmin && <label className="dashboard-age-filter"><span>Filtrar por edad</span><select value={ageRange} onChange={(event) => onAgeChange(event.target.value)}><option value="all">Todas las edades</option><option value="5-7">5 a 7 años</option><option value="8-10">8 a 10 años</option><option value="11-13">11 a 13 años</option><option value="14-17">14 a 17 años</option><option value="18-120">18 años o más</option></select></label>}
        <div className={`dashboard-growth ${changePositive ? "positive" : ""}`}><BarChart3 size={20} /><strong>{change == null ? "--" : `${changePositive ? "+" : ""}${change.toFixed(1)}%`}</strong><span>variación relativa</span></div>
      </div>
      <div className="dashboard-chart-summary"><div><span>INICIAL</span><strong>{formatScore(metrics?.inicial)}</strong><small>Pretest</small></div><div className="dashboard-summary-arrow">→</div><div><span>FINAL</span><strong className="dashboard-final-score">{formatScore(metrics?.final)}</strong><small>Postest</small></div><div className="dashboard-sample">{(metrics?.muestraPretest ?? 0) + (metrics?.muestraPostest ?? 0)} registros analizados</div></div>
      <div className="dashboard-recharts-wrap">
        {hasData ? <ResponsiveContainer width="100%" height="100%"><AreaChart data={chartData} margin={{ top: 18, right: 22, left: 0, bottom: 5 }}>
          <defs><linearGradient id="metricsAreaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#6366f1" stopOpacity={0.34} /><stop offset="100%" stopColor="#818cf8" stopOpacity={0.03} /></linearGradient></defs>
          <CartesianGrid vertical={false} stroke="#e7eaf4" strokeDasharray="4 5" />
          <XAxis dataKey="name" tick={{ fill: "#7b879b", fontSize: 12, fontWeight: 700 }} axisLine={false} tickLine={false} dy={12} />
          <YAxis domain={[0, 100]} ticks={[0, 25, 50, 75, 100]} tickFormatter={(value) => `${value}%`} tick={{ fill: "#9aa4b5", fontSize: 11 }} axisLine={false} tickLine={false} width={42} />
          <ReferenceLine y={50} stroke="#d9deed" strokeDasharray="3 5" />
          <Tooltip cursor={{ stroke: "#a5b4fc", strokeWidth: 1 }} contentStyle={{ border: "1px solid #e1e5f2", borderRadius: 14, boxShadow: "0 14px 35px rgba(15,23,42,.14)", background: "rgba(255,255,255,.96)" }} formatter={(value) => [`${Number(value).toFixed(1)}%`, "Puntuación"]} labelFormatter={(label) => String(label)} />
          <Area type="monotone" dataKey="score" stroke="#5b5ee8" strokeWidth={4} fill="url(#metricsAreaFill)" dot={{ r: 7, fill: "#fff", stroke: "#5b5ee8", strokeWidth: 4 }} activeDot={{ r: 9, fill: "#5b5ee8", stroke: "#fff", strokeWidth: 3 }} />
        </AreaChart></ResponsiveContainer> : <div className="dashboard-chart-empty"><BarChart3 size={28} /><strong>Aún no hay datos suficientes</strong><span>Registra una evaluación inicial y otra final para ver la evolución.</span></div>}
      </div>
    </section>
  );
}

export const DashboardScreen = ({ user }: DashboardScreenProps) => {
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [metricsError, setMetricsError] = useState(false);
  const [ageRange, setAgeRange] = useState("all");
  const permissions = new Set(user?.permisos ?? []);
  const roles = [...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []), ...(user?.roles ?? []).map((role) => role.nombre)].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
  const isAdmin = roles.some((role) => ["admin", "administrador", "1botpersonal", "personal", "empleado", "profesor", "teacher"].includes(role));
  const canViewMetrics = isAdmin || permissions.has("ver_metricas_evaluacion");
  const visibleItems = menuItems.filter((item) => isAdmin || permissions.has(item.requiredPermission));
  const restrictedItems = menuItems.length - visibleItems.length;
  const userId = user?.id ?? user?.userId;

  useEffect(() => {
    if (!userId || !canViewMetrics) return;
    setMetricsError(false);
    const [ageMin, ageMax] = ageRange === "all" ? [undefined, undefined] : ageRange.split("-").map(Number) as [number, number];
    (isAdmin ? getGlobalEvaluationMetrics(ageMin, ageMax) : getEvaluationMetrics(userId)).then(setMetrics).catch(() => setMetricsError(true));
  }, [userId, canViewMetrics, isAdmin, ageRange]);

  const displayName = useMemo(() => getDisplayName(user), [user]);
  const handleLogout = async () => { const response = await Logout(); if (!response.success) toast.error(response.error); else toast.success("Sesión cerrada"); navigate("/login", { replace: true }); };

  return <main className="dashboard-container">
    <aside className="dashboard-sidebar">
      <button className="dashboard-brand dashboard-brand-link" type="button" aria-label="Ir al playground de 1bot" onClick={() => navigate("/")}><img src="/logo.webp" alt="1bot" /><div><strong>1bot</strong><span>Ir al playground</span></div></button>
      <button className="dashboard-home active" onClick={() => navigate("/dashboard")}><LayoutDashboard size={18} />Resumen</button>
      <span className="dashboard-nav-label">Administración</span>
      <nav className="dashboard-nav" aria-label="Módulos de administración">{visibleItems.map((item) => { const Icon = item.icon; return <button key={item.path} onClick={() => navigate(item.path)}><Icon size={17} /><span>{item.title}</span><ChevronRight size={15} /></button>; })}</nav>
      <div className="dashboard-sidebar-footer"><div className="dashboard-user-mini"><div>{displayName.slice(0, 1).toUpperCase()}</div><span><strong>{displayName}</strong><small>{getDisplayRole(user)}</small></span></div><button type="button" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={() => void handleLogout()}><LogOut size={17} /></button></div>
    </aside>
    <section className="dashboard-main-content">
      <header className="dashboard-topbar"><div><span className="dashboard-kicker">Panel de administración</span><h1>Resumen de aprendizaje</h1><p>Una lectura clara del progreso y las herramientas de tu plataforma.</p></div><Button className="dashboard-editor-button" onPress={() => navigate("/")}><ArrowLeft size={16} />Volver al editor</Button></header>
      <section className="dashboard-overview-cards"><Card><Card.Content><span>Secciones disponibles</span><strong>{visibleItems.length}</strong><small>de {menuItems.length} módulos</small></Card.Content></Card><Card><Card.Content><span>Nivel de acceso</span><strong>{isAdmin ? "Total" : "Operativo"}</strong><small>{restrictedItems} restringidas</small></Card.Content></Card><Card><Card.Content><span>Estado de sesión</span><strong className="status-live">Activa</strong><small>{displayName}</small></Card.Content></Card></section>
      {canViewMetrics && <MetricsChart metrics={metrics} isAdmin={isAdmin} ageRange={ageRange} onAgeChange={setAgeRange} />}
      {metricsError && <p className="dashboard-chart-note">No se pudieron cargar las métricas en este momento.</p>}
    </section>
  </main>;
};

export default DashboardScreen;
