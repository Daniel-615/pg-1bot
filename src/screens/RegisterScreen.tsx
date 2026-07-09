import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerRequest } from "../api/auth";
import "./LoginScreen.css";

type RegisterScreenProps = {
    onRegisterSuccess?: () => void;
};

export default function RegisterScreen({ onRegisterSuccess }: RegisterScreenProps) {
    const navigate = useNavigate();
    const [nombre, setNombre] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [lastname, setLastname] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleRegister = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const trimmedNombre = nombre.trim();
        const trimmedEmail = email.trim();
        const trimmedLastName = lastname.trim();
        if (!trimmedNombre || !trimmedEmail || !trimmedLastName || !password || !confirmPassword) {
            toast.error("Completa todos los campos");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Las contraseñas no coinciden");
            return;
        }

        setIsSubmitting(true);

        const response = await registerRequest({
            nombre: trimmedNombre,
            email: trimmedEmail,
            apellido: trimmedLastName,
            password,
        });

        setIsSubmitting(false);

        if (!response.success) {
            toast.error(response.error);
            return;
        }

        toast.success("Cuenta creada exitosamente");
        onRegisterSuccess?.();
        navigate("/", { replace: true });
    };

    return (
        <div className="login-container register-container">
            <form className="login-card register-card" onSubmit={handleRegister}>
                <img
                    src="https://images.squarespace-cdn.com/content/v1/5c943a85ca525b02250b6fe8/95ec0138-ab9a-4251-bc6b-164813cd61a6/1bot+Logo.png?format=1500w"
                    alt="1bot"
                    className="logo"
                />

                <h1>Crear Cuenta</h1>

                <p className="subtitle">
                    Registra tu cuenta para comenzar
                </p>

                <div className="form-group">
                    <label htmlFor="register-name">Nombre</label>

                    <input
                        id="register-name"
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        placeholder="Maria"
                        autoComplete="name"
                        disabled={isSubmitting}
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="register-lastname">Apellido</label>

                    <input
                        id="register-lastname"
                        type="text"
                        value={lastname}
                        onChange={(e) => setLastname(e.target.value)}
                        placeholder="Garcia"
                        autoComplete="family-name"
                        disabled={isSubmitting}
                    />
                </div>


                <div className="form-group">
                    <label htmlFor="register-email">Correo</label>

                    <input
                        id="register-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="maria.garcia@correo.com"
                        autoComplete="email"
                        disabled={isSubmitting}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="register-password">Contraseña</label>

                    <div className="password-input">
                        <input
                            id="register-password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="********"
                            autoComplete="new-password"
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

                <div className="form-group">
                    <label htmlFor="register-confirm-password">Confirmar contraseña</label>

                    <input
                        id="register-confirm-password"
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="********"
                        autoComplete="new-password"
                        disabled={isSubmitting}
                    />
                </div>

                <button
                    type="submit"
                    className="login-button"
                    disabled={isSubmitting}
                >
                    {isSubmitting ? "Creando cuenta..." : "Crear Cuenta"}
                </button>

                <p className="auth-switch">
                    ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
                </p>

                <div className="footer compact-footer">
                    <p>Proporcionado por tu colegio</p>
                    <span>1bot v1.0</span>
                </div>
            </form>
        </div>
    );
}
