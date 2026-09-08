import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useLogin } from "../hooks/auth/loginHook";
import "../styles/LoginScreen.css";

type LoginScreenProps = {
    onLoginSuccess?: () => void;
};

export default function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const loginMutation = useLogin();
    const isSubmitting = loginMutation.isPending;

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedEmail = email.trim();

        if (!trimmedEmail || !password) {
            toast.error("Ingresa correo y contraseña");
            return;
        }

        const response = await loginMutation.mutateAsync({ email: trimmedEmail, password });

        if (!response.success) {
            toast.error(response.error);
            return;
        }

        toast.success("Inicio de sesión exitoso");
        onLoginSuccess?.();
        navigate("/", { replace: true });
    };

    return (
        <div className="login-container">
            <form className="login-card" onSubmit={handleLogin}>
                <img
                    src="https://images.squarespace-cdn.com/content/v1/5c943a85ca525b02250b6fe8/95ec0138-ab9a-4251-bc6b-164813cd61a6/1bot+Logo.png?format=1500w"
                    alt="1bot"
                    className="logo"
                />

                <h1>Bienvenido</h1>

                <p className="subtitle">
                    Ingresa a tu cuenta
                </p>

                <div className="form-group">
                    <label htmlFor="login-email">Correo</label>

                    <input
                        id="login-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maria.garcia@gmail.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="login-password">Contraseña</label>

                    <div className="password-input">
                        <input
                            id="login-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            autoComplete="current-password"
                            disabled={isSubmitting}
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="eye-button"
                            disabled={isSubmitting}
                            aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                            {showPassword ? "Ocultar" : "Ver"}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="login-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Iniciando..." : "Iniciar Sesión"}
                </button>

                <Link to="/forgot-password" className="forgot-password" aria-disabled={isSubmitting}>
                    ¿Olvidaste tu contraseña?
                </Link>

                <p className="auth-switch">
                    ¿No tienes cuenta? <Link to="/register">Crea una cuenta</Link>
                </p>

                <div className="footer">
                    <p>Proporcionado por tu colegio</p>
                    <span>1bot v1.0</span>
                </div>
            </form>
        </div>
    );
}
