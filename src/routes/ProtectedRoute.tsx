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
import "../styles/AppWorkspace.css";
import { hasRequiredPermissions } from "./permissions";
import { LoadingScreen } from "../screens/components/LoadingScreen";

type ProtectedRouteProps = {
    requiredPermissions?: string[];
    children: ReactNode | ((user: AuthUser) => ReactNode);
};

type SessionState = {
    isLoading: boolean;
    user: AuthUser | null;
    redirectTo: "/login" | "/informacion" | null;
};

const INFORMATION_SEEN_KEY = "1bot-information-seen";

function getUnauthenticatedRedirect(): "/login" | "/informacion" {
    try {
        const informationWasSeen = window.localStorage.getItem(INFORMATION_SEEN_KEY) === "true";
        if (!informationWasSeen) {
            window.localStorage.setItem(INFORMATION_SEEN_KEY, "true");
            return "/informacion";
        }
    } catch {
        // If storage is unavailable, keep the normal login flow.
    }

    return "/login";
}

function ProtectedRoute({ requiredPermissions = [], children }: ProtectedRouteProps) {
    const [session, setSession] = useState<SessionState>({
        isLoading: true,
        user: null,
        redirectTo: null,
    });

    useEffect(() => {
        let isMounted = true;

        void verifySessionRequest().then(async (currentSession) => {
            if (currentSession.success) {
                if (isMounted) {
                    setSession({ isLoading: false, user: currentSession.data, redirectTo: null });
                }

                return;
            }

            const refreshed = await refreshTokenRequest();

            if (refreshed.success) {
                const retrySession = await verifySessionRequest();

                if (retrySession.success) {
                    if (isMounted) {
                        setSession({ isLoading: false, user: retrySession.data, redirectTo: null });
                    }

                    return;
                }
            }

            if (isMounted) {
                setSession({ isLoading: false, user: null, redirectTo: getUnauthenticatedRedirect() });
            }
        });

        return () => {
            isMounted = false;
        };
    }, []);

    if (session.isLoading) {
        return <LoadingScreen label="Validando sesión" />;
    }

    if (session.redirectTo) {
        return <Navigate to={session.redirectTo} replace />;
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
