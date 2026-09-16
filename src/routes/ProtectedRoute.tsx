import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
    refreshTokenRequest,
    verifySessionRequest,
    type AuthUser,
} from "../services/auth.service";
import AccessDeniedScreen from "../screens/AccessDeniedScreen";
import { CookieConsent } from "../screens/components/CookieConsent";
import { OfflineIndicator } from "../screens/components/OfflineIndicator";
import i18n from "../i18n";
import "../styles/AppWorkspace.css";

type ProtectedRouteProps = {
    requiredPermissions?: string[];
    children: ReactNode | ((user: AuthUser) => ReactNode);
};

type SessionState = {
    isLoading: boolean;
    user: AuthUser | null;
    shouldLogin: boolean;
};

function hasRequiredPermissions(user: AuthUser | null, requiredPermissions: string[]) {
    const roles = [
        ...(Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : []),
        ...(user?.roles ?? []).map((role) => role.nombre),
    ].map((role) => role.trim().toLowerCase().replace(/\s+/g, ""));
    if (roles.some((role) => role === "admin" || role === "1botpersonal")) return true;

    const permissions = new Set(user?.permisos ?? []);
    return requiredPermissions.every((permission) => permissions.has(permission));
}

function ProtectedRoute({ requiredPermissions = [], children }: ProtectedRouteProps) {
    const [session, setSession] = useState<SessionState>({
        isLoading: true,
        user: null,
        shouldLogin: false,
    });

    useEffect(() => {
        let isMounted = true;

        void verifySessionRequest().then(async (currentSession) => {
            if (currentSession.success) {
                if (isMounted) {
                    setSession({ isLoading: false, user: currentSession.data, shouldLogin: false });
                }

                return;
            }

            const refreshed = await refreshTokenRequest();

            if (refreshed.success) {
                const retrySession = await verifySessionRequest();

                if (retrySession.success) {
                    if (isMounted) {
                        setSession({ isLoading: false, user: retrySession.data, shouldLogin: false });
                    }

                    return;
                }
            }

            if (isMounted) {
                setSession({ isLoading: false, user: null, shouldLogin: true });
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (session.isLoading) {
        return (
            <div className="app-container">
                <div className="workspace-loading">
                    <div className="workspace-loading-brand">
                        <div className="workspace-loading-orbit orbit-one"></div>
                        <div className="workspace-loading-orbit orbit-two"></div>
                        <div className="workspace-loading-logo-wrap">
                            <img className="workspace-loading-logo" src="logo.webp" alt="1bot" />
                        </div>
                    </div>
                    <div className="workspace-loading-copy">
                        <strong>{i18n.t("editorLoading")}</strong>
                        <span>{i18n.t("editorLoadingDescription")}</span>
                    </div>
                </div>
            </div>
        );
    }

    if (session.shouldLogin) {
        return <Navigate to="/login" replace />;
    }

    if (!hasRequiredPermissions(session.user, requiredPermissions)) {
        return (
            <>
                <AccessDeniedScreen />
                <OfflineIndicator />
            </>
        );
    }

    return (
        <>
            {typeof children === "function" ? children(session.user as AuthUser) : children}
            <CookieConsent />
            <OfflineIndicator />
        </>
    );
}

export default ProtectedRoute;
