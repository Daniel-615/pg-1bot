import axios from "axios";
import { attachAccessToken } from "./access-token";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}${normalizedPath}`;
}

export type UsuarioLite = {
    id: string;
    nombre: string;
    email: string;
};

export type RolLite = {
    id: number;
    nombre: string;
};

export type UsuarioRol = {
    usuarioId: string;
    rolId: number;
    usuario?: UsuarioLite;
    rol?: RolLite;
    createdAt?: string;
    updatedAt?: string;
};

export type UsuarioRolPagination = {
    rows: UsuarioRol[];
    total: number;
    page: number;
    totalPages: number;
};

export type UsuarioRolResponse<TData = unknown> = {
    ok: boolean;
    message?: string;
    data?: TData;
    total?: number;
    page?: number;
    totalPages?: number;
};

const usuarioRolApi = attachAccessToken(axios.create({
    baseURL: getAuthUrl("/usuario-rol"),
    withCredentials: true,
}));

export async function createUsuarioRol(data: {
    usuarioId: string;
    rolId: number;
}) {
    const response = await usuarioRolApi.post<UsuarioRolResponse<UsuarioRol>>(
        "/",
        data
    );

    return response.data;
}

export async function getUsuarioRoles(page = 1, limit = 10) {
    const response = await usuarioRolApi.get<UsuarioRolResponse<UsuarioRol[] | UsuarioRolPagination>>(
        "/",
        { params: { page, limit } }
    );

    return response.data;
}

export async function getUsuarioRolById(
    usuarioId: string,
    rolId: number | string
) {
    const response = await usuarioRolApi.get<UsuarioRolResponse<UsuarioRol>>(
        `/${usuarioId}/${rolId}`
    );

    return response.data;
}

export async function deleteUsuarioRol(
    usuarioId: string,
    rolId: number | string
) {
    const response = await usuarioRolApi.delete<UsuarioRolResponse>(
        `/${usuarioId}/${rolId}`
    );

    return response.data;
}

export default usuarioRolApi;
