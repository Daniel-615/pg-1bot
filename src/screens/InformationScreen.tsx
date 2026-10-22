import { useEffect, useState } from "react";
import { ArrowDown, ArrowRight, ArrowUp, Blocks, Check, ChevronDown, Cloud, Cpu, Download, ExternalLink, Play, Radio, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import "../styles/InformationScreen.css";

const AGENT_DOWNLOAD_URL =
  (import.meta.env.VITE_ARDUINO_AGENT_DOWNLOAD_URL as string | undefined) ||
  "https://github.com/Daniel-615/pg-1bot-arduino/releases/download/v1/1bot-arduino-agent-setup.exe";
const INFORMATION_SEEN_KEY = "1bot-information-seen";

const workflows = [
  {
    id: "blocks",
    icon: Blocks,
    label: "Construye",
    title: "De la idea al primer bloque",
    description: "Arrastra bloques para crear la lógica de tu proyecto. Aprende estructuras, sensores y control sin pelearte con la sintaxis.",
    code: ["al iniciar", "  encender LED", "  esperar 1 segundo"],
    color: "violet",
  },
  {
    id: "simulate",
    icon: Play,
    label: "Comprueba",
    title: "Prueba antes de conectar",
    description: "Genera código, revisa errores y visualiza el comportamiento de tu circuito con el simulador Wokwi.",
    code: ["simulador: activo", "placa: ESP32", "errores: 0"],
    color: "cyan",
  },
  {
    id: "compile",
    icon: Cloud,
    label: "Compila",
    title: "Elige dónde compilar",
    description: "Compila en la nube desde cualquier navegador o instala el agente para trabajar localmente y cargar por USB.",
    code: ["compilación: lista", "destino: ESP32", "firmware: generado"],
    color: "orange",
  },
];

const faqs = [
  ["¿Necesito instalar algo para empezar?", "No. Puedes crear proyectos y compilar en la nube directamente desde el navegador. Para cargar programas por USB desde tu ordenador, instala el agente Arduino."],
  ["¿Qué placas puedo usar?", "1bot trabaja con Arduino Uno, Nano, Mega, ESP32 y Codey. El editor adapta los bloques y el código a la placa que elijas."],
  ["¿Puedo guardar mis proyectos?", "Sí. Guarda tus proyectos localmente como archivo o en la nube para retomarlos desde cualquier lugar."],
];
const informationSectionIds = ["inicio", "como-funciona", "capacidades", "preguntas"];

export default function InformationScreen() {
  const [activeWorkflow, setActiveWorkflow] = useState("blocks");
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("inicio");
  const workflow = workflows.find((item) => item.id === activeWorkflow) ?? workflows[0];
  const WorkflowIcon = workflow.icon;

  useEffect(() => {
    try {
      window.localStorage.setItem(INFORMATION_SEEN_KEY, "true");
    } catch {
      // The information page remains public when storage is unavailable.
    }
  }, []);

  useEffect(() => {
    const sections = informationSectionIds
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visibleSection = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visibleSection) setActiveSection(visibleSection.target.id);
      },
      { rootMargin: "-18% 0px -60%", threshold: [0.05, 0.25, 0.5] }
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const moveSection = (direction: -1 | 1) => {
    const currentIndex = informationSectionIds.indexOf(activeSection);
    const nextIndex = Math.min(informationSectionIds.length - 1, Math.max(0, currentIndex + direction));
    scrollToSection(informationSectionIds[nextIndex]);
  };

  return (
    <main className="information-page">
      <div className="information-glow information-glow-one" />
      <div className="information-glow information-glow-two" />
      <header className="information-header">
        <Link to="/informacion" className="information-brand" aria-label="1bot, página de inicio">
          <img src="/logo.webp" alt="Logo de 1bot" />
          <span>1bot<span className="brand-dot">.</span></span>
        </Link>
        <nav aria-label="Navegación principal">
          <a href="#inicio">Inicio</a>
          <a href="#como-funciona">Cómo funciona</a>
          <a href="#capacidades">Capacidades</a>
          <a href="#preguntas">Preguntas</a>
          <Link to="/login" className="information-login">Iniciar sesión</Link>
          <Link to="/register" className="information-cta">Crear cuenta <ArrowRight size={15} /></Link>
        </nav>
      </header>

      <section className="information-hero" id="inicio">
        <div className="hero-copy">
          <p className="information-eyebrow"><Sparkles size={14} /> Aprende haciendo</p>
          <h1>Convierte ideas en <em>proyectos reales.</em></h1>
          <p className="hero-description">El espacio visual para aprender programación, electrónica y robótica creando con Arduino, ESP32 y Codey.</p>
          <div className="hero-actions">
            <Link to="/register" className="information-primary-action">Empezar gratis <ArrowRight size={17} /></Link>
            <a href="#como-funciona" className="information-secondary-action"><Play size={15} fill="currentColor" /> Ver cómo funciona</a>
          </div>
          <div className="hero-proof"><span className="proof-avatars"><i>✦</i><i>⌁</i><i>◉</i></span><span>Hecho para aprender, experimentar y compartir</span></div>
        </div>
        <div className="hero-visual" aria-label="Vista previa de un proyecto en 1bot">
          <div className="visual-orbit orbit-one" /><div className="visual-orbit orbit-two" />
          <div className="code-card">
            <div className="code-card-top"><span className="window-dots"><b /><b /><b /></span><span>mi_proyecto.1bot</span><span className="live-pill"><i /> EN VIVO</span></div>
            <div className="code-card-body"><div className="mini-toolbox"><span /><span /><span /><span /><span /></div><div className="mini-canvas"><div className="mini-block block-start">al iniciar</div><div className="connector" /><div className="mini-block block-action">encender <strong>LED</strong></div><div className="connector" /><div className="mini-block block-wait">esperar <strong>1</strong> segundo</div></div></div>
            <div className="code-card-footer"><span><Check size={14} /> Sin errores</span><span><Cpu size={14} /> ESP32</span><span className="footer-status"><i /> listo</span></div>
          </div>
          <div className="floating-chip chip-cloud"><Cloud size={16} /><span>Compila en la nube</span></div>
          <div className="floating-chip chip-board"><Cpu size={16} /><span>ESP32 conectado</span></div>
        </div>
      </section>

      <section className="information-stats" aria-label="Características de 1bot">
        <div><strong>5+</strong><span>placas compatibles</span></div><div><strong>100%</strong><span>visual para empezar</span></div><div><strong>0</strong><span>instalaciones para la nube</span></div><div><strong>∞</strong><span>ideas por construir</span></div>
      </section>

      <section className="information-section workflow-section" id="como-funciona" aria-labelledby="workflow-title">
        <div className="section-heading"><p className="information-eyebrow">Tu flujo de trabajo</p><h2 id="workflow-title">Una idea. Tres pasos.<br /><span>Un proyecto funcionando.</span></h2><p>Todo lo que necesitas para pasar de la curiosidad a un circuito que cobra vida.</p></div>
        <div className="workflow-layout"><div className="workflow-tabs">{workflows.map((item, index) => <button key={item.id} className={`workflow-tab ${activeWorkflow === item.id ? "is-active" : ""}`} onClick={() => setActiveWorkflow(item.id)} type="button"><span className={`tab-number ${item.color}`}>0{index + 1}</span><span><strong>{item.label}</strong><small>{item.title}</small></span><ArrowRight size={17} /></button>)}</div><div className={`workflow-preview preview-${workflow.color}`}><div className="preview-heading"><span className="preview-icon"><WorkflowIcon size={20} /></span><span><small>PASO ACTUAL</small><strong>{workflow.label}</strong></span><span className="preview-counter">0{workflows.findIndex((item) => item.id === workflow.id) + 1} / 03</span></div><h3>{workflow.title}</h3><p>{workflow.description}</p><div className="terminal"><div><span className="terminal-dot" /> <span className="terminal-title">1bot / playground</span><span className="terminal-live">● running</span></div>{workflow.code.map((line, index) => <code key={line}><i>{String(index + 1).padStart(2, "0")}</i>{line}</code>)}</div></div></div>
      </section>

      <section className="information-section capabilities-section" id="capacidades" aria-labelledby="capabilities-title"><div className="section-heading centered"><p className="information-eyebrow">Más que bloques</p><h2 id="capabilities-title">Un laboratorio completo<br /><span>para aprender creando.</span></h2></div><div className="capabilities-grid"><article className="capability-card capability-large"><div className="capability-icon violet"><Blocks /></div><span className="card-kicker">CREA</span><h3>Programación visual</h3><p>Construye algoritmos con bloques intuitivos y descubre cómo se convierten en código Arduino real.</p><div className="block-pills"><span>lógica</span><span>sensores</span><span>motores</span></div></article><article className="capability-card dark-card"><div className="capability-icon cyan"><Radio /></div><span className="card-kicker">EXPERIMENTA</span><h3>Simula tus circuitos</h3><p>Prueba conexiones y comportamiento antes de tocar el hardware.</p><div className="signal-lines"><i /><i /><i /><i /></div></article><article className="capability-card capability-wide"><div className="capability-icon orange"><Cloud /></div><div><span className="card-kicker">COMPILA DONDE QUIERAS</span><h3>Nube o agente local</h3><p>En la nube, sin instalaciones. En local, con el agente Arduino y conexión USB directa a tu placa.</p><div className="compile-options"><span><Cloud size={14} /> Nube</span><span><Download size={14} /> Agente local</span></div></div></article></div></section>

      <section className="agent-banner"><div className="agent-visual"><div className="agent-ring"><Download size={28} /></div><div className="agent-pulse" /></div><div><p className="information-eyebrow">¿Quieres trabajar sin límites?</p><h2>Descarga el agente Arduino</h2><p>Compila y carga tus programas por USB directamente desde tu ordenador. Instalación rápida para Windows.</p></div><a className="agent-download" href={AGENT_DOWNLOAD_URL} download><Download size={17} /> Descargar agente <span>.exe</span></a></section>

      <section className="information-section faq-section" id="preguntas" aria-labelledby="faq-title"><div className="faq-intro"><p className="information-eyebrow">Preguntas frecuentes</p><h2 id="faq-title">Antes de empezar</h2><p>Si tienes una idea, ya tienes lo más importante. Aquí resolvemos lo demás.</p><Link to="/register">Crear mi cuenta <ArrowRight size={15} /></Link></div><div className="faq-list">{faqs.map(([question, answer], index) => <div className={`faq-item ${openFaq === index ? "is-open" : ""}`} key={question}><button type="button" onClick={() => setOpenFaq(openFaq === index ? null : index)}><span>{question}</span><ChevronDown size={18} /></button><div className="faq-answer"><p>{answer}</p></div></div>)}</div></section>

      <nav className="information-side-nav" aria-label="Navegación de la página">
        <button type="button" onClick={() => moveSection(-1)} disabled={activeSection === informationSectionIds[0]} aria-label="Subir a la sección anterior"><ArrowUp size={16} /></button>
        <div className="information-side-dots">{informationSectionIds.map((id, index) => <button key={id} type="button" className={activeSection === id ? "is-active" : ""} onClick={() => scrollToSection(id)} aria-label={`Ir a ${id}`}><span>{String(index + 1).padStart(2, "0")}</span></button>)}</div>
        <button type="button" onClick={() => moveSection(1)} disabled={activeSection === informationSectionIds[informationSectionIds.length - 1]} aria-label="Bajar a la siguiente sección"><ArrowDown size={16} /></button>
      </nav>

      <footer className="information-footer"><Link to="/informacion" className="information-brand"><img src="/logo.webp" alt="" /><span>1bot<span className="brand-dot">.</span></span></Link><span>Aprender. Crear. Conectar.</span><div><a href="https://github.com/Daniel-615" target="_blank" rel="noreferrer" aria-label="Código de 1bot"><ExternalLink size={16} /></a><a href="#como-funciona" aria-label="Volver arriba"><ArrowRight size={16} /></a></div></footer>
    </main>
  );
}
