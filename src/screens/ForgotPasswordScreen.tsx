import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { requestPasswordReset } from "../services/auth.service";
import "../styles/LoginScreen.css";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email.trim()) return toast.error("Ingresa tu correo electrónico.");
    const response = await requestPasswordReset(email.trim());
    if (!response.success) return toast.error(response.error);
    setSent(true);
  };

  return <div className="login-container"><form className="login-card" onSubmit={submit}>
    <h1>Recuperar contraseña</h1>
    <p className="subtitle">{sent ? "Si el correo está registrado, recibirás un enlace para continuar." : "Te enviaremos instrucciones a tu correo."}</p>
    {!sent && <><div className="form-group"><label htmlFor="reset-email">Correo</label><input id="reset-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" /></div><button className="login-button" type="submit">Enviar enlace</button></>}
    <p className="auth-switch"><Link to="/login">Volver al inicio de sesión</Link></p>
  </form></div>;
}
