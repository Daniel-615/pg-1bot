import { LoaderCircle } from "lucide-react";
import "../../styles/LoadingScreen.css";

type LoadingScreenProps = { label: string };

export function LoadingScreen({ label }: LoadingScreenProps) {
  return <main className="loading-screen" role="status" aria-live="polite"><div className="loading-screen-mark"><img src="/logo.webp" alt="" /><LoaderCircle size={76} /></div><strong>{label}</strong><span>Preparando tu espacio de trabajo...</span></main>;
}
