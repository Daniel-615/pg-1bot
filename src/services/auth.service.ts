import axios from "axios";

const AUTH_API_URL = (import.meta.env.VITE_AUTH_API_URL as string );

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    return `${baseUrl}${normalizedPath}`;
}

export type RegisterUserPayload = Record<string, unknown>;

export type LoginCredentials = {
    email: string;
    password: string;
};

export type AuthUser = {
    id?: string;
    userId?: string;
    nombre?: string;
    apellido?: string;
    email?: string;
    rol?: string[] | string;
};

export type LoginResponse = {
    ok?: boolean;
    message?: string;
    user?: AuthUser;
};

type AuthErrorPayload = {
    error?: string;
    message?: string;
};

type AuthSuccessResponse<TData = unknown> = {
    success: true;
    data: TData;
};

type AuthErrorResponse = {
    success: false;
    error: string;
};

export type AuthResponse<TData = unknown> = AuthSuccessResponse<TData> | AuthErrorResponse;

function getAuthErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<AuthErrorPayload>(error)) {
        return error.response?.data?.error ?? error.response?.data?.message ?? fallback;
    }

    if (error instanceof Error) {
        return error.message;
    }

    return fallback;
}

export const registerRequest = async (user: RegisterUserPayload): Promise<AuthResponse> => {
    try {
        const response = await axios.post<unknown>(getAuthUrl("usuario/register"), user, {
            withCredentials: true,
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error, "Error de red o del servidor") };
    }
};

export const registerRequestEmployee = async (user: RegisterUserPayload): Promise<AuthResponse> => {
    try {
        const response = await axios.post<unknown>(getAuthUrl("usuario/register-admin"), user, {
            withCredentials: true,
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error, "Error de red o del servidor") };
    }
};

export const LoginRequest = async (credentials: LoginCredentials): Promise<AuthResponse<LoginResponse>> => {
    try {
        const response = await axios.post<LoginResponse>(getAuthUrl("usuario/login"), credentials, {
            withCredentials: true,
        });

        return {
            success: true,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: getAuthErrorMessage(error, "Error al iniciar sesión."),
        };
    }
};

export const refreshTokenRequest = async (): Promise<AuthResponse> => {
    try {
        const response = await axios.post<unknown>(getAuthUrl("usuario/refreshToken"), {}, {
            withCredentials: true,
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error, "Error de token") };
    }
};

export const verifySessionRequest = async (): Promise<AuthResponse<AuthUser>> => {
    try {
        const response = await axios.get<AuthUser>(getAuthUrl("usuario/verifyToken"), {
            withCredentials: true,
        });

        return { success: true, data: response.data };
    } catch (error) {
        return { success: false, error: getAuthErrorMessage(error, "Sesión inválida") };
    }
};

export const Logout = async (): Promise<AuthResponse> => {
    try {
        const response = await axios.post<unknown>(getAuthUrl("usuario/logout"), {}, {
            withCredentials: true,
        });

        return { success: true, data: response.data };
    } catch (error) {
        return {
            success: false,
            error: getAuthErrorMessage(error, "Error al cerrar sesión."),
        };
    }
};
