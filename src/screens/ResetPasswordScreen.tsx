import { useState, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../services/auth.service";
import "../styles/LoginScreen.css";

export default function ResetPasswordScreen() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const [done, setDone] = useState(false);
  const passwordRequirements = [
    { label: "Mínimo 8 caracteres", valid: password.length >= 8 },
    { label: "Una letra mayúscula", valid: /[A-Z]/.test(password) },
    { label: "Una letra minúscula", valid: /[a-z]/.test(password) },
    { label: "Al menos 1 número", valid: /\d/.test(password) },
    { label: "Al menos 1 símbolo", valid: /[^A-Za-z\d]/.test(password) },
  ];
  const passwordScore = passwordRequirements.filter((requirement) => requirement.valid).length;
  const passwordIsValid = passwordScore === passwordRequirements.length;
  const passwordStrength = password.length === 0
    ? "Débil"
    : passwordScore <= 2
      ? "Débil"
      : passwordScore <= 4
        ? "Segura"
        : "Muy segura";

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setShowValidation(true);
    if (!token) return toast.error("El enlace de recuperación no contiene un token.");
    if (password !== confirmation) return toast.error("Las contraseñas no coinciden.");
    if (!passwordIsValid) return toast.error("La contraseña debe cumplir todos los criterios.");
    const response = await resetPassword({ token, newPassword: password });
    if (!response.success) return toast.error(response.error);
    setDone(true);
  };

  return <div className="login-container"><form className="login-card" onSubmit={submit}>
    <h1>Nueva contraseña</h1>
    {done ? <><p className="subtitle">Tu contraseña fue actualizada correctamente.</p><p className="auth-switch"><Link to="/login">Iniciar sesión</Link></p></> : <>
      <p className="subtitle">Crea una contraseña segura para tu cuenta.</p>
      <div className="form-group">
        <label htmlFor="new-password">Nueva contraseña</label>
        <div className="password-input">
          <input
            id="new-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            aria-describedby={password.length > 0 ? "reset-password-requirements" : undefined}
            aria-invalid={showValidation && !passwordIsValid}
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="eye-button" aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {showPassword ? <EyeOff size={20} aria-hidden="true" /> : <Eye size={20} aria-hidden="true" />}
          </button>
        </div>
        {password.length > 0 && <>
          <div className="password-security-header"><p className="security-info">Seguridad de la contraseña:</p><p className={`password-strength strength-${passwordScore}`}><strong>{passwordStrength}</strong></p></div>
          <div className="password-security-line"></div>
          <ul id="reset-password-requirements" className="password-requirements">
            {passwordRequirements.map((requirement) => <li className={requirement.valid ? "is-valid" : ""} key={requirement.label}><span className="requirement-check" aria-hidden="true">{requirement.valid ? "✓" : "×"}</span>{requirement.label}</li>)}
          </ul>
        </>}
        {showValidation && !passwordIsValid && <p className="password-validation-message" role="alert">La contraseña debe cumplir todos los criterios.</p>}
      </div>
      <div className="form-group"><label htmlFor="confirm-password">Confirmar contraseña</label><input id="confirm-password" type={showPassword ? "text" : "password"} value={confirmation} onChange={(event) => setConfirmation(event.target.value)} autoComplete="new-password" /></div>
      <button className="login-button" type="submit">Cambiar contraseña</button>
    </>}
  </form></div>;
}
