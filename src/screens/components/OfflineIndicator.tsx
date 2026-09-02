import { useEffect, useState } from "react";
import "./OfflineIndicator.css";

export function OfflineIndicator() {
  const [online, setOnline] = useState(() => navigator.onLine);

  useEffect(() => {
    const setOnlineState = () => setOnline(true);
    const setOfflineState = () => setOnline(false);
    window.addEventListener("online", setOnlineState);
    window.addEventListener("offline", setOfflineState);

    return () => {
      window.removeEventListener("online", setOnlineState);
      window.removeEventListener("offline", setOfflineState);
    };
  }, []);

  return (
    <div className={`offline-indicator ${online ? "online" : "offline"}`} role="status">
      <span aria-hidden="true" />
      {online ? "En línea" : "Modo offline: datos guardados disponibles"}
    </div>
  );
}
