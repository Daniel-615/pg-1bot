import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resetPassword } from "../services/auth.service";
import "../styles/LoginScreen.css";

export default function ResetPasswordScreen() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [done, setDone] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!token) return toast.error("El enlace de recuperación no contiene un token.");
    if (password !== confirmation) return toast.error("Las contraseñas no coinciden.");
    const response = await resetPassword({ token, newPassword: password });
    if (!response.success) return toast.error(response.error);
    setDone(true);
  };

  return <div className="login-container"><form className="login-card" onSubmit={submit}>
    <h1>Nueva contraseña</h1>
    {done ? <><p className="subtitle">Tu contraseña fue actualizada correctamente.</p><p className="auth-switch"><Link to="/login">Iniciar sesión</Link></p></> : <><p className="subtitle">Debe tener mínimo 8 caracteres, mayúscula, minúscula y número.</p><div className="form-group"><label htmlFor="new-password">Nueva contraseña</label><input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="new-password" /></div><div className="form-group"><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" /></div><button className="login-button" type="submit">Cambiar contraseña</button></>}
  </form></div>;
}
