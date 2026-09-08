import axios from "axios";
import { attachAccessToken } from "./access-token";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;
    return `${baseUrl}${normalizedPath}`;
}

export type RolLite = {
    id: number;
    nombre: string;
};

export type PermisoLite = {
    id: number;
    nombre: string;
};

export type RolPermiso = {
    rolId: number;
    permisoId: number;
    rol?: RolLite;
    permiso?: PermisoLite;
    createdAt?: string;
    updatedAt?: string;
};

export type RolPermisoPagination = {
    rows: RolPermiso[];
    total: number;
    page: number;
    totalPages: number;
};

export type RolPermisoResponse<TData = unknown> = {
    ok?: boolean;
    success?: boolean;
    message?: string;
    data?: TData;
    total?: number;
    page?: number;
    totalPages?: number;
};

const rolPermisoApi = attachAccessToken(axios.create({
    baseURL: getAuthUrl("/rol-permiso"),
    withCredentials: true,
}));

export async function createRolPermiso(data: {
    rolId: number;
    permisoId: number;
}) {
    const response = await rolPermisoApi.post<RolPermisoResponse<RolPermiso>>(
        "/",
        data
    );

    return response.data;
}


export async function getRolPermisos(page = 1, limit = 10) {
    const response = await rolPermisoApi.get<
        RolPermisoResponse<RolPermiso[] | RolPermisoPagination>
    >("/", {
        params: { page, limit },
    });

    return response.data;
}


export async function getRolPermisoById(
    rolId: number | string,
    permisoId: number | string
) {
    const response = await rolPermisoApi.get<RolPermisoResponse<RolPermiso>>(
        `/${rolId}/${permisoId}`
    );

    return response.data;
}

export async function getPermisosNoAsignados(rolId: number | string) {
    const response = await rolPermisoApi.get<
        RolPermisoResponse<PermisoLite[]>
    >(`/rol-no-asignado/${rolId}`);

    return response.data;
}


export async function deleteRolPermiso(
    rolId: number | string,
    permisoId: number | string
) {
    const response = await rolPermisoApi.delete<RolPermisoResponse>(
        `/${rolId}/${permisoId}`
    );

    return response.data;
}

export default rolPermisoApi;
