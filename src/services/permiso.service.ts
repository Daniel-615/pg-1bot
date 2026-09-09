import axios from "axios";
import { attachAccessToken } from "./access-token";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}${normalizedPath}`;
}

export type Permiso = {
    id?: number;
    nombre: string;
    createdAt?: string;
    updatedAt?: string;
};

export type PermisoPagination = {
    rows: Permiso[];
    total: number;
    page: number;
    totalPages: number;
};

export type PermisoResponse<TData = unknown> = {
    ok: boolean;
    message?: string;
    data?: TData;
    permiso?: TData;
};

const permisoApi = attachAccessToken(axios.create({
    baseURL: getAuthUrl("/permiso"),
    withCredentials: true,
}));

export async function getPermisos(page = 1, limit = 10) {
    const response = await permisoApi.get<PermisoResponse<PermisoPagination>>("/", {
        params: { page, limit },
    });

    return response.data;
}
export async function getPermisoById(id: number | string) {
    const response = await permisoApi.get<PermisoResponse<Permiso>>(`/${id}`);
    return response.data;
}

export async function createPermiso(data: Pick<Permiso, "nombre">) {
    const response = await permisoApi.post<PermisoResponse<Permiso>>("/", data);
    return response.data;
}


export async function updatePermiso(
    id: number | string,
    data: Pick<Permiso, "nombre">
) {
    const response = await permisoApi.put<PermisoResponse<Permiso>>(`/${id}`, data);
    return response.data;
}

export async function deletePermiso(id: number | string) {
    const response = await permisoApi.delete<PermisoResponse>(`/${id}`);
    return response.data;
}

export default permisoApi;
