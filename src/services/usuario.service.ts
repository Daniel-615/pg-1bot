import axios from "axios";
import { attachAccessToken } from "./access-token";

const AUTH_API_URL = import.meta.env.VITE_AUTH_API_URL as string;

function getAuthUrl(path: string) {
    const baseUrl = AUTH_API_URL.endsWith("/") ? AUTH_API_URL : `${AUTH_API_URL}/`;
    const normalizedPath = path.startsWith("/") ? path.slice(1) : path;

    return `${baseUrl}${normalizedPath}`;
}

export type Usuario = {
    id?: string | number;
    userId?: string | number;
    nombre?: string;
    apellido?: string;
    email?: string;
    activo?: boolean | number | string;
    isActive?: boolean | number | string;
    estado?: boolean | number | string;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    [key: string]: unknown;
};

export type UsuarioPagination = {
    rows: Usuario[];
    total: number;
    page: number;
    totalPages: number;
};

export type UsuarioResponse<TData = unknown> = {
    ok?: boolean;
    message?: string;
    data?: TData;
    usuarios?: TData;
    users?: TData;
    rows?: Usuario[];
    total?: number;
    page?: number;
    totalPages?: number;
};

const usuarioApi = attachAccessToken(axios.create({
    baseURL: getAuthUrl("/usuario"),
    withCredentials: true,
}));

export async function findAllUsuarios() {
    const response = await usuarioApi.get<UsuarioResponse<Usuario[] | UsuarioPagination> | Usuario[]>("/findAll");

    return response.data;
}

export async function findAllUsuariosActivos() {
    const response = await usuarioApi.get<UsuarioResponse<Usuario[] | UsuarioPagination> | Usuario[]>("/findAllActivos");

    return response.data;
}

export default usuarioApi;
