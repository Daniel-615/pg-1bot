import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Target, TrendingUp } from "lucide-react";
import { getOwnEvaluationProgress, type EvaluationProgress, type EvaluationRecord } from "../services/evaluations.service";
import type { AuthUser } from "../services/auth.service";
import "../styles/ProgressScreen.css";

type ProgressScreenProps = { user?: AuthUser };

function scoreOf(evaluation: EvaluationRecord) {
  return Math.max(0, Math.min(100, Number(evaluation.puntuacion) / Number(evaluation.puntuacion_maxima) * 100));
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDuration(seconds?: number) {
  if (!seconds) return "Sin registro";
  const minutes = Math.floor(seconds / 60);
  return minutes ? `${minutes} min` : `${seconds} s`;
}

export default function ProgressScreen({ user }: ProgressScreenProps) {
  const navigate = useNavigate();
  const [progress, setProgress] = useState<EvaluationProgress | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    getOwnEvaluationProgress().then(setProgress).catch(() => setError(true));
  }, []);

  const evaluations = progress?.evaluations ?? [];
  const points = evaluations.map((evaluation, index) => {
    const x = evaluations.length === 1 ? 50 : 8 + index * (84 / (evaluations.length - 1));
    return `${x},${214 - scoreOf(evaluation) * 1.8}`;
  }).join(" ");
  const metrics = progress?.metrics;
  const before = metrics?.inicial;
  const after = metrics?.final;
  const delta = before !== null && before !== undefined && after !== null && after !== undefined ? after - before : null;
  const displayName = [user?.nombre, user?.apellido].filter(Boolean).join(" ") || user?.email || "Estudiante";

  return (
    <main className="progress-page">
      <header className="progress-header">
        <button type="button" className="progress-back" onClick={() => navigate("/")}><ArrowLeft size={18} />Volver al editor</button>
        <div className="progress-heading"><span>RUTA DE APRENDIZAJE</span><h1>Tu progreso, {displayName.split(" ")[0]}</h1><p>Observa qué cambió entre tu punto de partida y tus últimos resultados.</p></div>
        <div className="progress-header-mark"><TrendingUp size={22} /><span>Seguimiento personal</span></div>
      </header>

      {error ? <section className="progress-empty"><Target size={32} /><h2>No pudimos cargar tu progreso</h2><p>Intenta nuevamente en unos minutos.</p></section> : !progress ? <section className="progress-empty"><div className="progress-loader" /><p>Preparando tu resumen...</p></section> : (
        <div className="progress-content">
          <section className="progress-metric-grid">
            <article className="progress-metric progress-metric-before"><span>Antes · Pretest</span><strong>{before == null ? "--" : `${before.toFixed(0)}%`}</strong><small>Tu punto de partida</small></article>
            <article className="progress-metric progress-metric-after"><span>Ahora · Postest</span><strong>{after == null ? "--" : `${after.toFixed(0)}%`}</strong><small>Tu resultado más reciente</small></article>
            <article className="progress-metric progress-metric-change"><span>Cambio observado</span><strong>{delta == null ? "--" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} pts`}</strong><small>{metrics?.mejoraPorcentual == null ? "Aún falta una comparación" : `${metrics.mejoraPorcentual >= 0 ? "+" : ""}${metrics.mejoraPorcentual.toFixed(1)}% relativo`}</small></article>
          </section>

          <section className="progress-chart-card">
            <div className="progress-section-heading"><div><span>EVOLUCIÓN</span><h2>Tu recorrido de aprendizaje</h2><p>Cada punto representa una evaluación registrada.</p></div><div className="progress-legend"><i />Puntuación sobre 100</div></div>
            {evaluations.length ? <div className="progress-chart-wrap"><svg viewBox="0 0 100 240" role="img" aria-label="Gráfica de evolución de evaluaciones" preserveAspectRatio="none"><defs><linearGradient id="progressArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#16b8a6" stopOpacity=".26" /><stop offset="1" stopColor="#16b8a6" stopOpacity="0" /></linearGradient></defs><path d="M8 34H92M8 124H92M8 214H92" className="progress-grid-line" /><polygon points={`8,214 ${points} 92,214`} fill="url(#progressArea)" /><polyline points={points} className="progress-chart-line" />{evaluations.map((evaluation, index) => { const x = evaluations.length === 1 ? 50 : 8 + index * (84 / (evaluations.length - 1)); return <circle key={evaluation.id_evaluacion} cx={x} cy={214 - scoreOf(evaluation) * 1.8} r="2.1" className="progress-chart-dot" />; })}</svg><div className="progress-y-labels"><span>100</span><span>50</span><span>0</span></div></div> : <div className="progress-no-data"><BookOpen size={28} /><p>Aún no tienes evaluaciones registradas.</p></div>}
          </section>

          <section className="progress-history-card"><div className="progress-section-heading"><div><span>HISTORIAL</span><h2>Lo que has ido construyendo</h2></div><strong className="progress-count">{evaluations.length} {evaluations.length === 1 ? "evaluación" : "evaluaciones"}</strong></div><div className="progress-history-list">{evaluations.map((evaluation, index) => <article key={evaluation.id_evaluacion} className="progress-history-item"><div className="progress-history-index">{index + 1}</div><div className="progress-history-main"><strong>{evaluation.momento === "pretest" ? "Evaluación inicial" : "Evaluación de seguimiento"}</strong><span>{evaluation.instrumento}</span></div><div className="progress-history-score"><strong>{scoreOf(evaluation).toFixed(0)}%</strong><span>{formatDate(evaluation.createdAt)}</span></div><div className="progress-history-meta"><span><Clock3 size={14} />{formatDuration(evaluation.duracion_segundos)}</span><span><ArrowUpRight size={14} />{evaluation.intentos ?? 1} {(evaluation.intentos ?? 1) === 1 ? "intento" : "intentos"}</span></div></article>)}</div></section>
        </div>
      )}
    </main>
  );
}
