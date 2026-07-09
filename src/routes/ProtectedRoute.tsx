import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import {
    refreshTokenRequest,
    verifySessionRequest,
    type AuthUser,
} from "../api/auth";
import AccessDeniedScreen from "../screens/AccessDeniedScreen";

type ProtectedRouteProps = {
    allowedRoles: string[];
    children: ReactNode | ((user: AuthUser) => ReactNode);
};

type SessionState = {
    isLoading: boolean;
    user: AuthUser | null;
    shouldLogin: boolean;
};

function getUserRoles(user: AuthUser | null) {
    const roles = Array.isArray(user?.rol) ? user.rol : user?.rol ? [user.rol] : [];

    return roles.map((role) => role.toLowerCase());
}

function hasAllowedRole(user: AuthUser | null, allowedRoles: string[]) {
    const userRoles = getUserRoles(user);
    const normalizedAllowedRoles = allowedRoles.map((role) => role.toLowerCase());

    return userRoles.some((role) => normalizedAllowedRoles.includes(role));
}

function ProtectedRoute({ allowedRoles, children }: ProtectedRouteProps) {
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
                <div className="app-loading">Validando permisos...</div>
            </div>
        );
    }

    if (session.shouldLogin) {
        return <Navigate to="/login" replace />;
    }

    if (!hasAllowedRole(session.user, allowedRoles)) {
        return <AccessDeniedScreen />;
    }

    return <>{typeof children === "function" ? children(session.user as AuthUser) : children}</>;
}

export default ProtectedRoute;
