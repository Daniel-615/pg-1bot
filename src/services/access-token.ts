import type { AxiosInstance } from "axios";

const ACCESS_TOKEN_KEY = "access_token";

export function getAccessToken(): string | null {
    if (typeof window === "undefined") return null;

    const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const hashToken = hashParams.get(ACCESS_TOKEN_KEY);

    if (hashToken) {
        window.sessionStorage.setItem(ACCESS_TOKEN_KEY, hashToken);
        window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
        return hashToken;
    }

    return window.sessionStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
    if (typeof window !== "undefined") {
        window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
    }
}

export function attachAccessToken(client: AxiosInstance) {
    client.interceptors.request.use((config) => {
        const token = getAccessToken();
        if (token) {
            config.headers.set("Authorization", `Bearer ${token}`);
        }
        return config;
    });
    return client;
}
