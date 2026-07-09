import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/NotFoundScreen.css";

function NotFoundScreen() {
    const navigate = useNavigate();

    return (
        <main className="not-found-container">
            <section className="not-found-card">
                <div className="not-found-orbit" aria-hidden="true">
                    <span />
                    <span />
                    <span />
                </div>

                <img src="/logo.webp" alt="1bot" className="not-found-logo" />

                <p className="not-found-kicker">Error 404</p>
                <h1>Ruta no encontrada</h1>
                <p className="not-found-description">
                    La pantalla que buscas no existe o fue movida. Puedes volver al editor principal o regresar a la página anterior.
                </p>

                <div className="not-found-actions">
                    <button className="not-found-primary" onClick={() => navigate("/")}>
                        <Home size={18} />
                        Ir al inicio
                    </button>

                    <button className="not-found-secondary" onClick={() => navigate(-1)}>
                        <ArrowLeft size={18} />
                        Volver atrás
                    </button>
                </div>
            </section>
        </main>
    );
}

export default NotFoundScreen;
