import { useState } from "react";
import { ShieldCheck, X } from "lucide-react";
import "../../styles/CookieConsent.css";

const CONSENT_KEY = "1bot-cookie-consent-v1";

function hasConsent() {
  if (typeof window === "undefined") return true;
  return window.localStorage.getItem(CONSENT_KEY) !== null;
}

export function CookieConsent() {
  const [visible, setVisible] = useState(() => !hasConsent());
  const [detailsOpen, setDetailsOpen] = useState(false);

  if (!visible) return null;

  const saveConsent = (value: "accepted" | "essential") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setVisible(false);
  };

  return (
    <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-describedby="cookie-consent-description">
      <div className="cookie-consent-icon"><ShieldCheck size={22} /></div>
      <div className="cookie-consent-copy">
        <div className="cookie-consent-heading">
          <h2 id="cookie-consent-title">Tu privacidad importa</h2>
          <button type="button" className="cookie-consent-close" onClick={() => saveConsent("essential")} aria-label="Cerrar aviso"><X size={18} /></button>
        </div>
        <p id="cookie-consent-description">1bot utiliza cookies necesarias para mantener tu sesión segura y recordar preferencias básicas. No usamos cookies de publicidad.</p>
        {detailsOpen && <p className="cookie-consent-details">Las cookies de autenticación son <strong>httpOnly</strong> y se envían únicamente a nuestros servicios. Puedes continuar usando 1bot con solo las cookies esenciales.</p>}
        <button type="button" className="cookie-consent-link" onClick={() => setDetailsOpen((open) => !open)}>{detailsOpen ? "Ocultar detalles" : "Ver detalles"}</button>
      </div>
      <div className="cookie-consent-actions">
        <button type="button" className="cookie-essential-button" onClick={() => saveConsent("essential")}>Solo necesarias</button>
        <button type="button" className="cookie-accept-button" onClick={() => saveConsent("accepted")}>Aceptar</button>
      </div>
    </div>
  );
}
