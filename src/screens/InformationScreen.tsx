import { Link } from "react-router-dom";
import "../styles/InformationScreen.css";

export default function InformationScreen() {
  return (
    <main className="information-page">
      <header className="information-header">
        <Link to="/informacion" className="information-brand" aria-label="1bot, página de inicio">
          <img src="/logo.webp" alt="Logo de 1bot" />
          <span>1bot</span>
        </Link>
        <nav aria-label="Navegación principal">
          <Link to="/login">Iniciar sesión</Link>
          <Link to="/register" className="information-cta">Crear cuenta</Link>
        </nav>
      </header>

      <section className="information-hero">
        <p className="information-eyebrow">Aprendizaje tecnológico</p>
        <h1>Programación visual para Arduino y ESP32</h1>
        <p>
          1bot ayuda a estudiantes a aprender programación y electrónica creando proyectos con bloques visuales,
          simulación y generación de código.
        </p>
        <Link to="/register" className="information-primary-action">Empieza a crear proyectos</Link>
      </section>

      <section className="information-content" aria-labelledby="features-title">
        <p className="information-eyebrow">Una forma práctica de aprender</p>
        <h2 id="features-title">Herramientas para construir, probar y comprender</h2>
        <div className="information-grid">
          <article>
            <h3>Programación por bloques</h3>
            <p>Organiza la lógica de tus programas sin preocuparte por la sintaxis mientras desarrollas pensamiento computacional.</p>
          </article>
          <article>
            <h3>Código para placas</h3>
            <p>Genera código compatible con Arduino, ESP32 y otras placas desde un mismo espacio de trabajo.</p>
          </article>
          <article>
            <h3>Simulación y ejemplos</h3>
            <p>Prueba ideas, consulta proyectos de referencia y detecta errores antes de llevar el programa al hardware.</p>
          </article>
        </div>
      </section>

      <section className="information-bottom" aria-labelledby="boards-title">
        <h2 id="boards-title">Aprende con tu placa favorita</h2>
        <p>Explora proyectos educativos con Arduino Uno, Arduino Nano, Arduino Mega, ESP32 y Codey.</p>
        <Link to="/login">Acceder al editor de 1bot</Link>
      </section>

      <footer className="information-footer">© {new Date().getFullYear()} 1bot. Programación y electrónica para aprender creando.</footer>
    </main>
  );
}
