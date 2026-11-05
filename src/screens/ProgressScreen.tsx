import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowUpRight, BookOpen, Clock3, Target, TrendingUp } from "lucide-react";
import { getOwnEvaluationProgress, type EvaluationProgress, type EvaluationRecord } from "../services/evaluations.service";
import type { AuthUser } from "../services/auth.service";
import "../styles/ProgressScreen.css";

type ProgressScreenProps = { user?: AuthUser };

function scoreOf(evaluation: EvaluationRecord) {
  return Math.max(0, Math.min(100, Number(evaluation.puntuacion) / Number(evaluation.puntuacion_maxima) * 100));
}

function formatDate(value: string, language: string) {
  return new Intl.DateTimeFormat(language, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));
}

function formatDuration(seconds: number | undefined, t: (key: string, options?: Record<string, string | number>) => string) {
  if (!seconds) return t("progressNoRecord");
  const minutes = Math.floor(seconds / 60);
  return minutes ? t("progressMinutes", { count: minutes }) : t("progressSeconds", { count: seconds });
}

export default function ProgressScreen({ user }: ProgressScreenProps) {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
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
         <button type="button" className="progress-back" onClick={() => navigate("/")}><ArrowLeft size={18} />{t("progressBack")}</button>
         <div className="progress-heading"><span>{t("progressRoute")}</span><h1>{t("progressGreeting", { name: displayName.split(" ")[0] })}</h1><p>{t("progressDescription")}</p></div>
         <div className="progress-header-mark"><TrendingUp size={22} /><span>{t("progressTracking")}</span></div>
      </header>

       {error ? <section className="progress-empty"><Target size={32} /><h2>{t("progressLoadError")}</h2><p>{t("progressLoadErrorDescription")}</p></section> : !progress ? <section className="progress-empty"><div className="progress-loader" /><p>{t("progressLoading")}</p></section> : (
        <div className="progress-content">
          <section className="progress-metric-grid">
           <article className="progress-metric progress-metric-before"><span>{t("progressBefore")}</span><strong>{before == null ? "--" : `${before.toFixed(0)}%`}</strong><small>{t("progressStartingPoint")}</small></article>
           <article className="progress-metric progress-metric-after"><span>{t("progressNow")}</span><strong>{after == null ? "--" : `${after.toFixed(0)}%`}</strong><small>{t("progressLatestResult")}</small></article>
           <article className="progress-metric progress-metric-change"><span>{t("progressChange")}</span><strong>{delta == null ? "--" : `${delta >= 0 ? "+" : ""}${delta.toFixed(1)} ${t("progressPoints")}`}</strong><small>{metrics?.mejoraPorcentual == null ? t("progressNoComparison") : `${metrics.mejoraPorcentual >= 0 ? "+" : ""}${metrics.mejoraPorcentual.toFixed(1)}% ${t("progressRelative")}`}</small></article>
          </section>

          <section className="progress-chart-card">
             <div className="progress-section-heading"><div><span>{t("progressEvolution")}</span><h2>{t("progressJourney")}</h2><p>{t("progressChartDescription")}</p></div><div className="progress-legend"><i />{t("progressScore")}</div></div>
             {evaluations.length ? <div className="progress-chart-wrap"><svg viewBox="0 0 100 240" role="img" aria-label={t("progressChartAria")} preserveAspectRatio="none"><defs><linearGradient id="progressArea" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopColor="#16b8a6" stopOpacity=".26" /><stop offset="1" stopColor="#16b8a6" stopOpacity="0" /></linearGradient></defs><path d="M8 34H92M8 124H92M8 214H92" className="progress-grid-line" /><polygon points={`8,214 ${points} 92,214`} fill="url(#progressArea)" /><polyline points={points} className="progress-chart-line" />{evaluations.map((evaluation, index) => { const x = evaluations.length === 1 ? 50 : 8 + index * (84 / (evaluations.length - 1)); return <circle key={evaluation.id_evaluacion} cx={x} cy={214 - scoreOf(evaluation) * 1.8} r="2.1" className="progress-chart-dot" />; })}</svg><div className="progress-y-labels"><span>100</span><span>50</span><span>0</span></div></div> : <div className="progress-no-data"><BookOpen size={28} /><p>{t("progressNoEvaluations")}</p></div>}
          </section>

           <section className="progress-history-card"><div className="progress-section-heading"><div><span>{t("progressHistory")}</span><h2>{t("progressBuilt")}</h2></div><strong className="progress-count">{evaluations.length} {t(evaluations.length === 1 ? "progressEvaluationOne" : "progressEvaluationMany")}</strong></div><div className="progress-history-list">{evaluations.map((evaluation, index) => <article key={evaluation.id_evaluacion} className="progress-history-item"><div className="progress-history-index">{index + 1}</div><div className="progress-history-main"><strong>{evaluation.momento === "pretest" ? t("progressInitialEvaluation") : t("progressFollowupEvaluation")}</strong><span>{evaluation.instrumento}</span></div><div className="progress-history-score"><strong>{scoreOf(evaluation).toFixed(0)}%</strong><span>{formatDate(evaluation.createdAt, i18n.language)}</span></div><div className="progress-history-meta"><span><Clock3 size={14} />{formatDuration(evaluation.duracion_segundos, t)}</span><span><ArrowUpRight size={14} />{evaluation.intentos ?? 1} {t((evaluation.intentos ?? 1) === 1 ? "progressAttemptOne" : "progressAttemptMany")}</span></div></article>)}</div></section>
        </div>
      )}
    </main>
  );
}
