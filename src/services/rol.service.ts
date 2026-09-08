import axios from "axios";
import { attachAccessToken } from "./access-token";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}${normalizedPath}`;
}

export type Rol = {
    id: number;
    nombre: string;
};

export type RolPagination = {
    rows: Rol[];
    total: number;
    page: number;
    totalPages: number;
};

export type RolError = {
    ok: boolean;
    error?: string;
    message?: string;
};

export type RolResponse<TData = unknown> = {
    ok: boolean;
    message: string;
    data?: TData;
    rol?: TData;
    total?: number;
    page?: number;
    totalPages?: number;
};

const rolApi = attachAccessToken(axios.create({
    baseURL: getAuthUrl("/rol"),
    withCredentials: true,
}));

export async function getRoles(page = 1, limit = 10) {
    const response = await rolApi.get<RolResponse<Rol[] | RolPagination>>("/", {
        params: { page, limit },
    });
    return response.data;
}

export async function getRolById(id: number | string) {
    const response = await rolApi.get<RolResponse<Rol>>(`/${id}`);
    return response.data;
}

export async function createRol(data: Pick<Rol, "nombre">) {
    const response = await rolApi.post<RolResponse<Rol>>("/", data);
    return response.data;
}

export async function updateRol(id: number | string, data: Pick<Rol, "nombre">) {
    const response = await rolApi.put<RolResponse<Rol>>(`/${id}`, data);
    return response.data;
}

export async function deleteRol(id: number | string) {
    const response = await rolApi.delete<RolResponse>(`/${id}`);
    return response.data;
}

export default rolApi;
