import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import { resendVerificationRequest, verifyEmailRequest } from "../services/auth.service";
import "../styles/LoginScreen.css";

export default function VerifyAccountScreen() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [email, setEmail] = useState(searchParams.get("email") ?? "");
    const [code, setCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!email.trim() || !/^\d{6}$/.test(code)) {
            toast.error("Ingresa tu correo y el código de 6 dígitos.");
            return;
        }
        setIsSubmitting(true);
        const response = await verifyEmailRequest({ email: email.trim(), code });
        setIsSubmitting(false);
        if (!response.success) {
            toast.error(response.error);
            return;
        }
        toast.success("Cuenta confirmada. Ya puedes iniciar sesión.");
        navigate("/login", { replace: true });
    };

    const resend = async () => {
        if (!email.trim()) return toast.error("Ingresa tu correo.");
        const response = await resendVerificationRequest(email.trim());
        if (response.success) toast.success("Código enviado.");
        else toast.error(response.error);
    };

    return <div className="login-container"><form className="login-card" onSubmit={handleSubmit}>
        <img src="/logo.webp" alt="1bot" className="logo" />
        <h1>Confirma tu cuenta</h1>
        <p className="subtitle">Te enviamos un código de 6 dígitos a tu correo.</p>
        <div className="form-group"><label htmlFor="verify-email">Correo</label><input id="verify-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={isSubmitting} /></div>
        <div className="form-group"><label htmlFor="verify-code">Código OTP</label><input id="verify-code" inputMode="numeric" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" disabled={isSubmitting} /></div>
        <button type="submit" className="login-button" disabled={isSubmitting}>{isSubmitting ? "Confirmando..." : "Confirmar cuenta"}</button>
        <button type="button" className="forgot-password" onClick={() => void resend()} disabled={isSubmitting}>Reenviar código</button>
        <p className="auth-switch"><Link to="/login">Volver a iniciar sesión</Link></p>
    </form></div>;
}
