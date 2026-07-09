import { ArrowLeft, Home, ShieldAlert } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "./NotFoundScreen.css";

function AccessDeniedScreen() {
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
                <p className="not-found-kicker">Acceso restringido</p>
                <h1>No autorizado</h1>
                <p className="not-found-description">
                    Tu rol no tiene permisos para entrar a esta sección. Esta área está reservada para usuarios autorizados.
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

                    <button className="not-found-secondary" onClick={() => navigate("/dashboard")}>
                        <ShieldAlert size={18} />
                        Ir al dashboard
                    </button>
                </div>
            </section>
        </main>
    );
}

export default AccessDeniedScreen;
